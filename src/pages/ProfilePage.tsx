import { Building2, ShieldCheck, User, Users } from "lucide-react";
import { SettingsShell } from "./SettingsShell";
import { useApp } from "../app/AppContext";

export default function ProfilePage() {
  const { user } = useApp();

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

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
            {initials || "A"}
          </div>

          <div className="staff-profile-kitchn-avatar-copy">
            <strong>{fullName || "Utilisateur"}</strong>
            <span>{user.hotelName}</span>
          </div>
        </div>

        <div className="staff-profile-kitchn-fields">
          <label className="staff-profile-kitchn-field">
            <span>Nom complet</span>
            <div className="staff-profile-kitchn-input">
              {fullName || "—"}
            </div>
          </label>

          <label className="staff-profile-kitchn-field">
            <span>Établissement</span>
            <div className="staff-profile-kitchn-input staff-profile-kitchn-input-with-icon">
              <Building2 size={17} />
              <span>{user.hotelName}</span>
            </div>
          </label>

          <label className="staff-profile-kitchn-field">
            <span>Service</span>
            <div className="staff-profile-kitchn-input staff-profile-kitchn-input-with-icon">
              <Users size={17} />
              <span>{user.departments.join(" · ") || "—"}</span>
            </div>
          </label>

          <label className="staff-profile-kitchn-field">
            <span>Rôle</span>
            <div className="staff-profile-kitchn-input staff-profile-kitchn-input-with-icon">
              <ShieldCheck size={17} />
              <span>{user.role}</span>
            </div>
          </label>
        </div>

        <p className="staff-profile-kitchn-note">
          Votre rôle, votre service et votre établissement sont gérés par l’administration.
        </p>
      </section>
    </SettingsShell>
  );
}
