import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";

export default function MorePage() {
  const items = [
    { to: "/clients", label: "Clients", icon: Users },
    { to: "/instructions", label: "Consignes", icon: ClipboardList },
    { to: "/events", label: "Événements", icon: CalendarDays },
    { to: "/search", label: "Recherche", icon: Search },
    { to: "/profile", label: "Paramètres", icon: Settings },
  ];

  return (
    <>
      <PageHeader title="Plus" subtitle="Outils et informations complémentaires." />

      <div className="more-list">
        {items.map(({ to, label, icon: Icon }) => (
          <Link to={to} key={to}>
            <span>
              <Icon size={19} />
              {label}
            </span>
            <ChevronRight size={18} />
          </Link>
        ))}
      </div>
    </>
  );
}
