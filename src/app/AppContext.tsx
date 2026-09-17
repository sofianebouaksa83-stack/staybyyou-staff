import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Session,
  User as SupabaseUser,
} from "@supabase/supabase-js";

import { supabase } from "../services/supabase";
import type { Role, User } from "../types";

export type ProfileRow = {
  id?: string;
  user_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  [key: string]: unknown;
};

export type HotelMembershipRow = {
  id: string;
  user_id: string;
  hotel_id: string;
  role: string;
  active: boolean;
};

type HotelRow = {
  id: string;
  name: string;
};

type DepartmentRelation =
  | { name?: string | null }
  | Array<{ name?: string | null }>
  | null;

type MemberDepartmentRow = {
  is_primary?: boolean | null;
  staff_departments?: DepartmentRelation;
};

type LoadedStaffAccount = {
  profile: ProfileRow | null;
  membership: HotelMembershipRow;
  user: User;
};

type AppContextValue = {
  session: Session | null;
  user: User;
  profile: ProfileRow | null;
  membership: HotelMembershipRow | null;
  hotelId: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  reloadAuth: () => Promise<void>;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

const EMPTY_USER = {
  id: "",
  firstName: "",
  lastName: "",
  role: "employee",
  departments: [],
  hotelId: "",
  hotelName: "",
} as unknown as User;

const AppContext = createContext<AppContextValue | null>(null);

function readString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function roleFromMembership(role: string): Role {
  switch (role.toLowerCase()) {
    case "admin":
      return "admin";
    case "direction":
      return "direction";
    case "manager":
      return "manager";
    default:
      return "employee";
  }
}

function departmentFromMembership(role: string) {
  const labels: Record<string, string> = {
    reception: "Réception",
    kitchen: "Cuisine",
    delivery: "Livraison",
  };

  return labels[role.toLowerCase()] ?? "Équipe";
}

function departmentName(row: MemberDepartmentRow) {
  const relation = row.staff_departments;

  if (Array.isArray(relation)) {
    return readString(relation[0]?.name);
  }

  return readString(relation?.name);
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Une erreur inattendue est survenue.";
}

async function loadStaffAccount(
  authUser: SupabaseUser
): Promise<LoadedStaffAccount> {
  const [profileResult, membershipResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle(),
    supabase
      .from("hotel_members")
      .select("id, user_id, hotel_id, role, active")
      .eq("user_id", authUser.id)
      .eq("active", true)
      .limit(1)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    throw new Error(
      `Impossible de charger le profil : ${profileResult.error.message}`
    );
  }

  if (membershipResult.error) {
    throw new Error(
      `Impossible de charger l'accès hôtel : ${membershipResult.error.message}`
    );
  }

  const profile = (profileResult.data ?? null) as ProfileRow | null;
  const membership = membershipResult.data as HotelMembershipRow | null;

  if (!membership) {
    throw new Error(
      "Aucun accès actif à un hôtel n'est associé à ce compte."
    );
  }

  const [hotelResult, departmentsResult] = await Promise.all([
    supabase
      .from("hotels")
      .select("id, name")
      .eq("id", membership.hotel_id)
      .single(),
    supabase
      .from("staff_member_departments")
      .select("is_primary, staff_departments(name)")
      .eq("hotel_member_id", membership.id)
      .order("is_primary", { ascending: false }),
  ]);

  if (hotelResult.error) {
    throw new Error(
      `Impossible de charger l'hôtel : ${hotelResult.error.message}`
    );
  }

  const hotel = hotelResult.data as HotelRow;
  const metadata = authUser.user_metadata as Record<string, unknown>;
  const emailName = authUser.email?.split("@")[0] ?? "Utilisateur";
  const fullName = readString(
    profile?.full_name,
    profile?.display_name,
    metadata.full_name,
    metadata.name,
    emailName
  );
  const fullNameParts = fullName.split(/\s+/).filter(Boolean);
  const firstName = readString(
    profile?.first_name,
    metadata.first_name,
    fullNameParts[0],
    "Utilisateur"
  );
  const lastName = readString(
    profile?.last_name,
    metadata.last_name,
    fullNameParts.slice(1).join(" ")
  );

  const departmentRows = departmentsResult.error
    ? []
    : ((departmentsResult.data ?? []) as MemberDepartmentRow[]);
  const departments = departmentRows
    .map(departmentName)
    .filter((name): name is string => Boolean(name));

  if (departments.length === 0) {
    departments.push(departmentFromMembership(membership.role));
  }

  const user = {
    id: authUser.id,
    firstName,
    lastName,
    email: readString(profile?.email, authUser.email),
    avatarUrl: readString(profile?.avatar_url, metadata.avatar_url),
    role: roleFromMembership(membership.role),
    departments,
    hotelId: membership.hotel_id,
    hotelName: hotel.name,
  } as unknown as User;

  return { profile, membership, user };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [staffUser, setStaffUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [membership, setMembership] =
    useState<HotelMembershipRow | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(
    () => new Date()
  );

  const mountedRef = useRef(false);
  const pendingHydrationRef = useRef<{
    userId: string;
    promise: Promise<void>;
  } | null>(null);

  const clearAccount = useCallback(() => {
    setSession(null);
    setStaffUser(null);
    setProfile(null);
    setMembership(null);
    setAuthError(null);
    setAuthLoading(false);
    pendingHydrationRef.current = null;
  }, []);

  const hydrateUser = useCallback((authUser: SupabaseUser) => {
    const pending = pendingHydrationRef.current;

    if (pending?.userId === authUser.id) {
      return pending.promise;
    }

    setAuthLoading(true);
    setAuthError(null);

    const promise = loadStaffAccount(authUser)
      .then((account) => {
        if (!mountedRef.current) return;

        setProfile(account.profile);
        setMembership(account.membership);
        setStaffUser(account.user);
      })
      .catch((error: unknown) => {
        if (mountedRef.current) {
          setProfile(null);
          setMembership(null);
          setStaffUser(null);
          setAuthError(errorMessage(error));
        }

        throw error;
      })
      .finally(() => {
        if (mountedRef.current) {
          setAuthLoading(false);
        }

        if (pendingHydrationRef.current?.promise === promise) {
          pendingHydrationRef.current = null;
        }
      });

    pendingHydrationRef.current = {
      userId: authUser.id,
      promise,
    };

    return promise;
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mountedRef.current) return;

      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
        return;
      }

      setSession(data.session);

      if (data.session) {
        void hydrateUser(data.session.user).catch(() => undefined);
      } else {
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mountedRef.current) return;

      setSession(nextSession);

      if (!nextSession || event === "SIGNED_OUT") {
        clearAccount();
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "USER_UPDATED" ||
        event === "INITIAL_SESSION"
      ) {
        window.setTimeout(() => {
          if (mountedRef.current) {
            void hydrateUser(nextSession.user).catch(() => undefined);
          }
        }, 0);
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [clearAccount, hydrateUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setAuthLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
        throw error;
      }

      setSession(data.session);
      await hydrateUser(data.user);
    },
    [hydrateUser]
  );

  const signOut = useCallback(async () => {
    setAuthLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      throw error;
    }

    clearAccount();
  }, [clearAccount]);

  const reloadAuth = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);

    const {
      data: { session: currentSession },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      throw error;
    }

    setSession(currentSession);

    if (!currentSession) {
      clearAccount();
      return;
    }

    await hydrateUser(currentSession.user);
  }, [clearAccount, hydrateUser]);

  const isAuthenticated = Boolean(
    session && staffUser && membership?.hotel_id
  );

  const value = useMemo<AppContextValue>(
    () => ({
      session,
      user: staffUser ?? EMPTY_USER,
      profile,
      membership,
      hotelId: membership?.hotel_id ?? null,
      isAuthenticated,
      authLoading,
      authError,
      signIn,
      signOut,
      reloadAuth,
      selectedDate,
      setSelectedDate,
    }),
    [
      session,
      staffUser,
      profile,
      membership,
      isAuthenticated,
      authLoading,
      authError,
      signIn,
      signOut,
      reloadAuth,
      selectedDate,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);

  if (!value) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return value;
}
