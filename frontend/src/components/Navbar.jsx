import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <span className="navbar__brand">Diplomski rad</span>
      {user && (
        <div className="navbar__user">
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="navbar__avatar"
            />
          )}
          <span>{user.name}</span>
          <button onClick={handleLogout} className="navbar__logout">
            Odjava
          </button>
        </div>
      )}
    </header>
  );
}
