import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ dark, setDark }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-300/20 bg-white/40 backdrop-blur-md dark:bg-slate-950/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="brand text-xl font-bold text-ocean dark:text-amber-300">
          GOD'S EYE
        </Link>

        <nav className="hidden gap-5 text-sm font-semibold md:flex">
          <NavLink to="/search">Search</NavLink>
          <NavLink to="/report-lost">Report Lost</NavLink>
          <NavLink to="/report-found">Report Found</NavLink>
          {user && <NavLink to="/dashboard">My Posts</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-slate-300/40 px-3 py-1 text-sm"
            onClick={() => setDark(!dark)}
            type="button"
          >
            {dark ? 'Light' : 'Dark'}
          </button>

          {!user ? (
            <>
              <Link to="/login" className="rounded-lg px-3 py-1 text-sm font-semibold">
                Login
              </Link>
              <Link to="/signup" className="rounded-lg bg-ocean px-3 py-1 text-sm font-semibold text-white">
                Sign Up
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-amber-500 px-3 py-1 text-sm font-semibold text-slate-900"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
