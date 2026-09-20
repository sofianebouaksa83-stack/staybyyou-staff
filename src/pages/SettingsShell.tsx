import type { ReactNode } from "react";
import {
  Bell,
  Building2,
  ShieldCheck,
  SlidersHorizontal,
  UserCircle,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { useApp } from "../app/AppContext";
import { useHotelPermission } from "../features/permissions/hooks/useHotelPermission";
import "./SettingsShell.css";

type SettingsShellProps = {
  children: ReactNode;
  sectionLabel?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
};

const personalItems = [
  { to: "/profile", label: "Profil", icon: UserCircle },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const settingsAdminItems = [
  {
    to: "/admin/hotel",
    label: "Établissement",
    icon: Building2,
  },
];

const teamAdminItems = [
  {
    to: "/admin/users",
    label: "Utilisateurs",
    icon: Users,
  },
  {
    to: "/admin/services",
    label: "Services",
    icon: SlidersHorizontal,
  },
  {
    to: "/admin/roles",
    label: "Rôles & permissions",
    icon: ShieldCheck,
  },
];

export function SettingsShell({
  children,
  sectionLabel,
  sectionTitle,
  sectionSubtitle,
}: SettingsShellProps) {
  const {
    user,
    hotelId,
  } = useApp();

  const {
    allowed: canViewSettings,
  } = useHotelPermission(
    hotelId,
    "settings.view"
  );

  const {
    allowed: canViewTeam,
  } = useHotelPermission(
    hotelId,
    "team.view"
  );

  const items = [
    ...personalItems,

    ...(canViewSettings
      ? settingsAdminItems
      : []),

    ...(canViewTeam
      ? teamAdminItems
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Paramètres"
        subtitle="Compte personnel, notifications et configuration."
      />

      <div className="staff-settings">
        <div className="staff-settings-mobile-tabs" aria-label="Navigation des paramètres">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `staff-settings-mobile-tab${isActive ? " active" : ""}`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="staff-settings-layout">
          <aside className="staff-settings-sidebar">
            <section className="staff-settings-user">
              <small>CONNECTÉ EN TANT QUE</small>
              <strong>
                {user.firstName} {user.lastName}
              </strong>
              <span>{user.hotelName}</span>
              <em>Rôle : {user.role}</em>
            </section>

            <nav className="staff-settings-nav" aria-label="Navigation des paramètres">
              <small>NAVIGATION</small>

              {items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `staff-settings-nav-item${isActive ? " active" : ""}`
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          <section className="staff-settings-main">
            {(sectionLabel || sectionTitle || sectionSubtitle) && (
              <header className="staff-settings-section-head">
                {sectionLabel && <small>{sectionLabel}</small>}
                {sectionTitle && <h2>{sectionTitle}</h2>}
                {sectionSubtitle && <p>{sectionSubtitle}</p>}
              </header>
            )}

            {children}
          </section>
        </div>
      </div>
    </>
  );
}
