import { useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

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
import { useNotifications } from "../../features/admin/notifications/hooks/useNotifications";

const navItems = [
  { to: "/", label: "Aujourd’hui", icon: Home },
  { to: "/hotel", label: "Hôtel", icon: Building2 },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/tasks", label: "Tâches", icon: CheckSquare },
  { to: "/more", label: "Plus", icon: Menu },
];

const roleLabels: Record<
  Role,
  string
> = {
  owner: "Propriétaire",
  admin: "Administrateur",
  manager: "Manager",
  kitchen: "Cuisine",
  reception: "Réception",
  delivery: "Livraison",
  bedroom: "Hébergement",
  read_only: "Lecture seule",
};

export function AppLayout() {
  const { user, signOut, hotelId, session, } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { unreadCount, } = useNotifications( hotelId, session?.user.id );
  
  const isMessagesPage =
    location.pathname === "/messages" ||
    location.pathname.startsWith("/messages/");

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
    <div
      className={
        isMessagesPage
          ? "app-shell app-shell-messages staybyyou-staff-shell"
          : "app-shell staybyyou-staff-shell"
      }
    >
      <style>{`
        .staybyyou-staff-shell {
          min-height: 100vh;
        }

        .staybyyou-staff-shell .staff-desktop-navbar {
          display: none;
        }

        @media (min-width: 1024px) {
          .staybyyou-staff-shell {
            display: block !important;
          }

          .staybyyou-staff-shell .sidebar {
            display: none !important;
          }

          .staybyyou-staff-shell .main,
          .staybyyou-staff-shell .main.main-messages {
            width: 100% !important;
            min-width: 0;
            margin: 0 !important;
          }

          .staybyyou-staff-shell .topbar {
            display: none !important;
          }

          .staybyyou-staff-shell .staff-desktop-navbar {
            position: sticky;
            top: 0;
            z-index: 50;
            display: grid;
            grid-template-columns: minmax(210px, 1fr) auto minmax(210px, 1fr);
            align-items: center;
            min-height: 76px;
            padding: 0 28px;
            border-bottom: 1px solid rgba(23, 62, 49, 0.10);
            background: rgba(243, 240, 232, 0.96);
            box-shadow: 0 4px 20px rgba(23, 62, 49, 0.04);
            backdrop-filter: blur(18px);
          }

          .staybyyou-staff-shell .staff-navbar-brand {
            justify-self: start;
            display: inline-flex;
            align-items: center;
            border: 0;
            padding: 0;
            background: transparent;
            cursor: pointer;
          }

          .staybyyou-staff-shell .staff-navbar-brand img {
            display: block;
            width: auto;
            height: 48px;
            object-fit: contain;
          }

          .staybyyou-staff-shell .staff-desktop-nav {
            justify-self: center;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 5px;
            border: 1px solid rgba(23, 62, 49, 0.08);
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.44);
          }

          .staybyyou-staff-shell .staff-desktop-nav a {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-height: 42px;
            padding: 0 14px;
            border-radius: 12px;
            color: rgba(23, 62, 49, 0.72);
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease;
          }

          .staybyyou-staff-shell .staff-desktop-nav a:hover {
            color: #173e31;
            background: rgba(23, 62, 49, 0.055);
          }

          .staybyyou-staff-shell .staff-desktop-nav a.active {
            color: #173e31;
            background: rgba(255, 255, 255, 0.92);
            box-shadow: 0 2px 10px rgba(23, 62, 49, 0.08);
          }

          .staybyyou-staff-shell .staff-navbar-actions {
            justify-self: end;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .staybyyou-staff-shell .staff-navbar-icon,
          .staybyyou-staff-shell .staff-navbar-profile {
            border: 1px solid rgba(23, 62, 49, 0.10);
            background: rgba(255, 255, 255, 0.55);
            color: #173e31;
            cursor: pointer;
            transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
          }

          .staybyyou-staff-shell .staff-navbar-icon:hover,
          .staybyyou-staff-shell .staff-navbar-profile:hover {
            background: rgba(255, 255, 255, 0.90);
            border-color: rgba(199, 164, 93, 0.30);
          }

          .staybyyou-staff-shell .staff-navbar-icon {
            position: relative;
            display: inline-grid;
            place-items: center;
            width: 42px;
            height: 42px;
            border-radius: 13px;
          }

          .staybyyou-staff-shell .notification-button {
            position: relative;
          }

          .staybyyou-staff-shell .notification-badge {
            position: absolute;
            top: 4px;
            right: 3px;

            display: grid;
            min-width: 18px;
            height: 18px;
            place-items: center;

            padding: 0 4px;

            border: 2px solid #f3f0e8;
            border-radius: 999px;

            background: #c7a45d;
            color: #173e31;

            font-size: 9px;
            font-weight: 800;
            line-height: 1;
          }

          .staybyyou-staff-shell .staff-navbar-profile {
            display: flex;
            align-items: center;
            gap: 10px;
            min-height: 44px;
            padding: 5px 10px 5px 6px;
            border-radius: 14px;
          }

          .staybyyou-staff-shell .staff-navbar-avatar {
            display: grid;
            place-items: center;
            width: 32px;
            height: 32px;
            border-radius: 10px;
            background: #173e31;
            color: #f3f0e8;
            font-size: 12px;
            font-weight: 700;
          }

          .staybyyou-staff-shell .staff-navbar-user {
            display: flex;
            max-width: 150px;
            flex-direction: column;
            align-items: flex-start;
            line-height: 1.15;
          }

          .staybyyou-staff-shell .staff-navbar-user strong {
            overflow: hidden;
            max-width: 100%;
            color: #173e31;
            font-size: 13px;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .staybyyou-staff-shell .staff-navbar-user small {
            margin-top: 3px;
            overflow: hidden;
            max-width: 100%;
            color: rgba(23, 62, 49, 0.55);
            font-size: 10px;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .staybyyou-staff-shell .mobile-nav {
            display: none !important;
          }
        }

        @media (min-width: 1024px) and (max-width: 1240px) {
          .staybyyou-staff-shell .staff-desktop-navbar {
            grid-template-columns: auto 1fr auto;
            gap: 18px;
            padding-inline: 20px;
          }

          .staybyyou-staff-shell .staff-desktop-nav {
            gap: 2px;
          }

          .staybyyou-staff-shell .staff-desktop-nav a {
            gap: 6px;
            padding-inline: 10px;
          }

          .staybyyou-staff-shell .staff-navbar-user {
            display: none;
          }
        }
      `}</style>

      <header className="staff-desktop-navbar" aria-label="Navigation principale">
        <button
          className="staff-navbar-brand"
          type="button"
          onClick={() => navigate("/")}
          aria-label="Retour à Aujourd’hui"
        >
          <img
            src="/logo_StayByYou/staybyyou_blanc_slogan_sansfond.png"
            alt="StayByYou Staff"
          />
        </button>

        <nav className="staff-desktop-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="staff-navbar-actions">
          <button
            className="staff-navbar-icon"
            type="button"
            onClick={() => navigate("/search")}
            aria-label="Rechercher"
            title="Rechercher"
          >
            <Search size={18} />
          </button>

          <button
            className="staff-navbar-icon notification-button"
            type="button"
            onClick={() => navigate("/notifications")}
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                : "Notifications"
            }
            title="Notifications"
          >
            <Bell size={18} />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
            <i />
          </button>

          <div className="staff-navbar-profile" aria-label="Compte utilisateur">
            <div className="staff-navbar-avatar">{initials || "S"}</div>
            <div className="staff-navbar-user">
              <strong>{user.firstName}</strong>
              <small>
                {user.departments[0] ?? "Équipe"} · {roleLabels[user.role]}
              </small>
            </div>
          </div>

          <button
            className="staff-navbar-icon"
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

      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("/")}>
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

      <main className={isMessagesPage ? "main main-messages" : "main"}>
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
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                  : "Notifications"
              }
            >
              <Bell size={18} />

{unreadCount > 0 && (
  <span className="notification-badge">
    {unreadCount > 99
      ? "99+"
      : unreadCount}
  </span>
)}
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

        {!isMessagesPage && (
          <div className="global-date-bar">
            <DateNavigator />
          </div>
        )}

        <div className={isMessagesPage ? "content content-messages" : "content"}>
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
