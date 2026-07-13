import { useAuth } from "@/context/AuthContext";
import NavIcon from "@/components/layout/NavIcon";

export default function Navbar({ onMenuToggle, isMenuOpen }) {
  const { user } = useAuth();

  return (
    <header className="navbar">
      {user && (
        <div className="navbar__user">
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="navbar__avatar"
            />
          )}
          <span>{user.name || `${user.firstName} ${user.lastName}`}</span>
        </div>
      )}

      <button
        type="button"
        className="navbar__menu-btn"
        onClick={onMenuToggle}
        aria-label={isMenuOpen ? "Zatvori meni" : "Otvori meni"}
        aria-expanded={isMenuOpen}
      >
        <NavIcon name={isMenuOpen ? "close" : "menu"} />
      </button>
    </header>
  );
}
