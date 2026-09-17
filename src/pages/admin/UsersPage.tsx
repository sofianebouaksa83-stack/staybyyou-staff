import { Plus } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { demoUsers } from "../../data/mock";

export default function UsersPage() {
  return (
    <>
      <PageHeader
        title="Utilisateurs"
        subtitle="Équipe, rôles et services."
        action={<button className="primary-button small-button"><Plus size={16}/> Inviter</button>}
      />

      <div className="panel table-wrap">
        <table>
          <thead>
            <tr><th>Utilisateur</th><th>Service</th><th>Rôle</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {demoUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.departments.join(", ")}</td>
                <td>{user.role}</td>
                <td><span className="status-pill">Actif</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
