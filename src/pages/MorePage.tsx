import {
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Search,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { useApp } from "../app/AppContext";
import { can } from "../features/permissions/permissions";

export default function MorePage() {
  const { user } = useApp();

  const items = [
    { to:"/clients", label:"Clients", icon:Users, show:true },
    { to:"/instructions", label:"Consignes", icon:ClipboardList, show:true },
    { to:"/events", label:"Événements", icon:CalendarDays, show:true },
    { to:"/search", label:"Recherche", icon:Search, show:true },
    { to:"/notifications", label:"Notifications", icon:Bell, show:true },
    { to:"/profile", label:"Profil", icon:UserCircle, show:true },
    { to:"/admin", label:"Administration", icon:Settings, show:can(user.role, "admin.read") },
  ];

  return (
    <>
      <PageHeader title="Plus" subtitle="Outils et informations complémentaires." />
      <div className="more-list">
        {items.filter((item) => item.show).map(({to,label,icon:Icon}) => (
          <Link to={to} key={to}>
            <span><Icon size={19}/>{label}</span>
            <ChevronRight size={18}/>
          </Link>
        ))}
      </div>
    </>
  );
}
