import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Building2,
  Check,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import { SettingsShell } from "../SettingsShell";
import { useApp } from "../../app/AppContext";

const ROLE_LABELS: Record<string, string> = {
  owner: "Propriétaire",
  admin: "Administrateur",
  manager: "Manager",
  kitchen: "Cuisine",
  reception: "Réception",
  delivery: "Livraison",
  bedroom: "Hébergement",
  read_only: "Lecture seule",
};

export default function ProfilePage() {
  const {
    user,
    updateProfile,
  } = useApp();

  const [
    firstName,
    setFirstName,
  ] = useState("");

  const [
    lastName,
    setLastName,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] = useState(false);

  useEffect(() => {
    setFirstName(
      user.firstName ?? ""
    );

    setLastName(
      user.lastName ?? ""
    );
  }, [
    user.firstName,
    user.lastName,
  ]);

  const fullName =
    `${user.firstName ?? ""} ${
      user.lastName ?? ""
    }`.trim();

  const initials =
    `${
      user.firstName?.[0] ?? ""
    }${
      user.lastName?.[0] ?? ""
    }`.toUpperCase();

  const hasChanges =
    useMemo(() => {
      return (
        firstName.trim() !==
          (
            user.firstName ??
            ""
          ).trim() ||
        lastName.trim() !==
          (
            user.lastName ??
            ""
          ).trim()
      );
    }, [
      firstName,
      lastName,
      user.firstName,
      user.lastName,
    ]);

  const roleLabel =
    ROLE_LABELS[user.role] ??
    user.role ??
    "—";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !hasChanges ||
      saving
    ) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile({
        firstName,
        lastName,
      });

      setSuccess(true);

      window.setTimeout(() => {
        setSuccess(false);
      }, 2500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue pendant l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsShell
      sectionLabel="Compte personnel"
      sectionTitle="Profil"
      sectionSubtitle="Vos informations personnelles et votre établissement."
    >
      <section className="staff-profile-kitchn-card">
        <div className="staff-profile-kitchn-title">
          <span className="staff-profile-kitchn-title-icon">
            <User size={18} />
          </span>

          <h3>Profil</h3>
        </div>

        <div className="staff-profile-kitchn-avatar-block">
          <div className="staff-profile-kitchn-avatar">
            {initials || "U"}
          </div>

          <div className="staff-profile-kitchn-avatar-copy">
            <strong>
              {fullName ||
                "Utilisateur"}
            </strong>

            <span>
              {user.hotelName ||
                "Établissement non renseigné"}
            </span>
          </div>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="staff-profile-kitchn-fields">
            <label className="staff-profile-kitchn-field">
              <span>
                Prénom
              </span>

              <input
                className="staff-profile-kitchn-input"
                type="text"
                value={
                  firstName
                }
                onChange={(
                  event
                ) =>
                  setFirstName(
                    event.target
                      .value
                  )
                }
                autoComplete="given-name"
                disabled={
                  saving
                }
              />
            </label>

            <label className="staff-profile-kitchn-field">
              <span>
                Nom
              </span>

              <input
                className="staff-profile-kitchn-input"
                type="text"
                value={
                  lastName
                }
                onChange={(
                  event
                ) =>
                  setLastName(
                    event.target
                      .value
                  )
                }
                autoComplete="family-name"
                disabled={
                  saving
                }
              />
            </label>

            <label className="staff-profile-kitchn-field">
              <span>
                Établissement
              </span>

              <div className="staff-profile-kitchn-input staff-profile-kitchn-input-with-icon">
                <Building2
                  size={17}
                />

                <span>
                  {user.hotelName ||
                    "—"}
                </span>
              </div>
            </label>

            <label className="staff-profile-kitchn-field">
              <span>
                Service
              </span>

              <div className="staff-profile-kitchn-input staff-profile-kitchn-input-with-icon">
                <Users
                  size={17}
                />

                <span>
                  {user.departments.join(
                    " · "
                  ) || "—"}
                </span>
              </div>
            </label>

            <label className="staff-profile-kitchn-field">
              <span>
                Rôle
              </span>

              <div className="staff-profile-kitchn-input staff-profile-kitchn-input-with-icon">
                <ShieldCheck
                  size={17}
                />

                <span>
                  {roleLabel}
                </span>
              </div>
            </label>
          </div>

          {error && (
            <p
              role="alert"
              style={{
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              style={{
                marginTop: 16,
                marginBottom: 0,
                display: "flex",
                alignItems:
                  "center",
                gap: 8,
              }}
            >
              <Check
                size={17}
              />

              Profil mis à jour.
            </p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              marginTop: 22,
            }}
          >
            <button
              type="submit"
              disabled={
                !hasChanges ||
                saving ||
                !firstName.trim()
              }
              style={{
                minHeight: 42,
                padding:
                  "0 18px",
                borderRadius: 12,
                border: 0,
                font: "inherit",
                fontWeight: 700,

                cursor:
                  !hasChanges ||
                  saving ||
                  !firstName.trim()
                    ? "not-allowed"
                    : "pointer",

                opacity:
                  !hasChanges ||
                  saving ||
                  !firstName.trim()
                    ? 0.55
                    : 1,
              }}
            >
              {saving
                ? "Enregistrement…"
                : "Enregistrer les modifications"}
            </button>
          </div>
        </form>

        <p className="staff-profile-kitchn-note">
          Votre rôle, votre
          service et votre
          établissement sont
          gérés par
          l’administration.
        </p>
      </section>
    </SettingsShell>
  );
}