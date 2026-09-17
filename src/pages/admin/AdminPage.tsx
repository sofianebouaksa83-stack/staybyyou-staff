import {
  Building2,
  ChevronRight,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { useApp } from "../../app/AppContext";
import { can } from "../../features/permissions/permissions";

const links = [
  { to:"/admin/hotel", title:"Établissement", desc:"Informations et configuration de l’hôtel", icon:Building2 },
  { to:"/admin/users", title:"Utilisateurs", desc:"Équipe, invitations et accès", icon:Users },
  { to:"/admin/services", title:"Services", desc:"Services et organisation", icon:SlidersHorizontal },
  { to:"/admin/roles", title:"Rôles & permissions", desc:"Contrôlez précisément les droits", icon:ShieldCheck },
];

export default function AdminPage() {
  const { user } = useApp();

  if (!can(user.role, "admin.read")) return <Navigate to="/" replace />;

  return (
    <>
      <PageHeader title="Administration" subtitle="Configuration de StayByYou Staff." />
      <div className="admin-grid">
        {links.map(({to,title,desc,icon:Icon}) => (
          <Link className="admin-card" to={to} key={to}>
            <Icon />
            <div>
              <strong>{title}</strong>
              <p>{desc}</p>
            </div>
            <ChevronRight />
          </Link>
        ))}
      </div>
    </>
  );
}
