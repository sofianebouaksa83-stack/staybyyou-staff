import { SettingsShell } from "../SettingsShell";

const roles = [
  ["Employé", "Lecture des informations utiles, messages et tâches assignées."],
  ["Responsable", "Gestion opérationnelle de son service."],
  ["Direction", "Accès transversal et reporting."],
  ["Admin", "Configuration complète de l’établissement."],
];

export default function RolesPage() {
  return (
    <SettingsShell
      sectionLabel="Administration"
      sectionTitle="Rôles & permissions"
      sectionSubtitle="Les droits seront appliqués côté interface puis côté Supabase/RLS."
    >
      <div className="role-grid">
        {roles.map(([role, desc]) => (
          <article className="role-card" key={role}>
            <h3>{role}</h3>
            <p>{desc}</p>
            <button>Voir les permissions</button>
          </article>
        ))}
      </div>
    </SettingsShell>
  );
}
