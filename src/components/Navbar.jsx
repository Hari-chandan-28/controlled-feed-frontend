import  { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

const links = [
  { path: '/feed', label: 'Feed', icon: '📰' },
  { path: '/f1', label: 'F1', icon: '🏎️' },
  { path: '/live', label: 'Live', icon: '🔴' },
  { path: '/cricket', label: 'Cricket', icon: '🏏' },
  { path: '/chat', label: 'AI Chat', icon: '🤖' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };
    return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/feed" className="text-2xl font-display tracking-wider">
          CONTROLLED<span className="text-primary">FEED</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? 'bg-primary text-white'
                  : 'text-muted hover:text-white hover:bg-surface'
              }`}
            >
              <span className="mr-1">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="hidden md:block px-4 py-2 border border-border text-muted hover:border-primary hover:text-primary text-sm rounded-lg transition-all"
        >
          Logout
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white text-2xl"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-border px-4 py-4 flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium ${
                location.pathname === link.path
                  ? 'bg-primary text-white'
                  : 'text-muted hover:text-white'
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="px-4 py-3 text-left text-muted hover:text-primary text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;