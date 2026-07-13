import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getNavItemsForRole } from "./navItems";
import NavIcon from "./NavIcon";

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = getNavItemsForRole(user?.role);

  function handleLogout() {
    logout();
    onClose?.();
    navigate("/login");
  }

  return (
    <>
      {/* Overlay - samo na mobilnom, kada je meni otvoren */}
      {isOpen && (
        <div
          className="app-sidebar__overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${isOpen ? "app-sidebar--open" : ""}`}
        aria-label="Glavna navigacija"
      >
        <div className="app-sidebar__brand">
          <span className="app-sidebar__brand-badge">UKC</span>
          <span className="app-sidebar__brand-text">Republike Srpske</span>
        </div>

        {user && (
          <div className="app-sidebar__user">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name || user.firstName}
                className="app-sidebar__avatar"
              />
            )}
            <div className="app-sidebar__user-info">
              <strong>
                {user.firstName} {user.lastName}
              </strong>
              <span>{user.role === "doctor" ? "Doktor" : "Pacijent"}</span>
            </div>
          </div>
        )}

        <nav className="app-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `app-sidebar__link ${isActive ? "app-sidebar__link--active" : ""}`
              }
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="app-sidebar__logout"
          onClick={handleLogout}
        >
          <NavIcon name="logout" />
          <span>Odjavi se</span>
        </button>
      </aside>
    </>
  );
}
