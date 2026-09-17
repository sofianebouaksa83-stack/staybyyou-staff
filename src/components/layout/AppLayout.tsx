import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  CheckSquare,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Search,
} from "lucide-react";

import { useApp } from "../../app/AppContext";
import type { Role } from "../../types";
import { DateNavigator } from "./DateNavigator";

const navItems = [
  { to: "/", label: "Aujourd’hui", icon: Home },
  { to: "/hotel", label: "Hôtel", icon: Building2 },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/tasks", label: "Tâches", icon: CheckSquare },
  { to: "/more", label: "Plus", icon: Menu },
];

const roleLabels: Record<Role, string> = {
  employee: "Employé",
  manager: "Responsable",
  direction: "Direction",
  admin: "Admin",
};

export function AppLayout() {
  const { user, signOut } = useApp();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  const initials = `${user.firstName?.[0] ?? ""}${
    user.lastName?.[0] ?? ""
  }`.toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => navigate("/")}
        >
          <img
            src="/logo_StayByYou/staybyyou_blanc_slogan_sansfond.png"
            alt="StayByYou"
            className="sidebar-logo"
          />
        </button>

        <nav className="side-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="profile-card">
          <div className="avatar">{initials || "S"}</div>
          <div>
            <strong>{user.firstName}</strong>
            <small>
              {user.departments[0] ?? "Équipe"} · {roleLabels[user.role]}
            </small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">{user.hotelName}</span>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              onClick={() => navigate("/search")}
              aria-label="Rechercher"
            >
              <Search size={18} />
            </button>

            <button
              className="icon-button notification-button"
              onClick={() => navigate("/notifications")}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>

            <button
              className="icon-button"
              type="button"
              onClick={() => void handleSignOut()}
              aria-label="Se déconnecter"
              title="Se déconnecter"
              disabled={isSigningOut}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="global-date-bar">
          <DateNavigator />
        </div>

        <div className="content">
          <Outlet />
        </div>
      </main>

      <nav className="mobile-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
