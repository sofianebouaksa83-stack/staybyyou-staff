import { Plus } from "lucide-react";
import { demoUsers } from "../../data/mock";
import { SettingsShell } from "../SettingsShell";

export default function UsersPage() {
  return (
    <SettingsShell
      sectionLabel="Administration"
      sectionTitle="Utilisateurs"
      sectionSubtitle="Équipe, rôles et services."
    >
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="primary-button small-button">
          <Plus size={16} />
          Inviter
        </button>
      </div>

      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Service</th>
              <th>Rôle</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            {demoUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.departments.join(", ")}</td>
                <td>{user.role}</td>
                <td>
                  <span className="status-pill">Actif</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsShell>
  );
}
