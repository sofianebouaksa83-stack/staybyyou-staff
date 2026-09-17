import { PageHeader } from "../components/ui/PageHeader";
import { useApp } from "../app/AppContext";

export default function ProfilePage() {
  const { user } = useApp();

  return (
    <>
      <PageHeader title="Profil" />
      <div className="profile-page-card">
        <div className="avatar profile-avatar">{user.firstName[0]}{user.lastName[0]}</div>
        <h2>{user.firstName} {user.lastName}</h2>
        <p>{user.hotelName}</p>
        <span>{user.departments.join(" · ")}</span>
        <small>Rôle : {user.role}</small>
      </div>
    </>
  );
}
