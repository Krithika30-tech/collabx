import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-indigo-600 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="text-xl font-bold">CollabX</Link>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/projects" className="hover:underline">Projects</Link>
              <Link to="/people" className="hover:underline">People</Link>
              <Link to="/matches" className="hover:underline">Matches</Link>
              <Link to="/profile" className="hover:underline">Profile</Link>
              <span className="opacity-80">Hi, {user.name}</span>
              <button onClick={handleLogout} className="rounded bg-white px-3 py-1 font-medium text-indigo-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="rounded bg-white px-3 py-1 font-medium text-indigo-600">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}