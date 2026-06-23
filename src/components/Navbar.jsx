import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FeedIcon, F1Icon, LiveIcon, CricketIcon, ChatIcon, ProfileIcon
} from './icons/NavIcons';
import logo from '../assets/logo.png';
const links = [
  { path: '/feed',    label: 'Feed',    Icon: FeedIcon },
  { path: '/f1',      label: 'F1',      Icon: F1Icon },
  { path: '/live',    label: 'Live',    Icon: LiveIcon },
  { path: '/cricket', label: 'Cricket', Icon: CricketIcon },
  { path: '/chat',    label: 'AI Chat', Icon: ChatIcon },
  { path: '/profile', label: 'Profile', Icon: ProfileIcon },
];

const Navbar = () => {
  const { logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
   <nav
  className="fixed top-0 left-0 right-0 z-50"
  style={{
    background: 'rgba(0,0,0,0.00)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  }}
>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/feed" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Sportiva" className="w-8 h-8 object-contain" />
          <span className="text-lg font-black tracking-tight text-white">
            SPORT<span className="text-primary">IVA</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const isLive = link.path === '/live';
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold
                            transition-all flex items-center gap-2
                            ${isActive ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
              >
                {/* Active background pill */}
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  />
                )}

                <span className="relative flex items-center gap-2">
                  <link.Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-white/35'
                    }`}
                  />
                  {link.label}
                  {/* Live pulsing dot */}
                  {isLive && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isActive ? 'bg-live' : 'bg-white/30'
                      }`}
                      style={isActive ? { boxShadow: '0 0 6px #00E5A0' } : {}}
                    />
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Logout — desktop */}
        <div className="hidden md:flex items-center">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white/40
                       hover:text-white/80 transition-all border border-white/8
                       hover:border-white/20"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white/60 hover:text-white transition-colors p-2"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 6H17M3 10H17M3 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-white/5 px-4 py-4 flex flex-col gap-1"
          style={{
            background: 'rgba(8,9,12,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const isLive = link.path === '/live';
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                            font-semibold transition-all
                            ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                style={isActive ? { background: 'rgba(255,255,255,0.07)' } : {}}
              >
                <link.Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-white/35'
                  }`}
                />
                <span className="flex-1">{link.label}</span>
                {isLive && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-live' : 'bg-white/20'
                    }`}
                    style={isActive ? { boxShadow: '0 0 6px #00E5A0' } : {}}
                  />
                )}
              </Link>
            );
          })}

          <div className="border-t border-white/5 mt-2 pt-3">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm font-semibold
                         text-white/40 hover:text-primary transition-colors rounded-xl"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;