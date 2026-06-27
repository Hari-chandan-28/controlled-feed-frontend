import { useState, useEffect, useRef, useCallback } from 'react';
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

  // Pill animation state
  const navRef = useRef(null);
  const tabRefs = useRef([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLifted, setIsLifted] = useState(false);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);
  const pillBaseLeft = useRef(0);
  const liftTimer = useRef(null);

  // Find active tab index
  const activeIndex = links.findIndex(l => l.path === location.pathname);

  // Move pill to a tab index
  const movePillToIndex = useCallback((index) => {
    const el = tabRefs.current[index];
    if (!el || !navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const tabRect = el.getBoundingClientRect();
    setPillStyle({
      left: tabRect.left - navRect.left,
      width: tabRect.width,
      opacity: 1,
    });
    pillBaseLeft.current = tabRect.left - navRect.left;
  }, []);

  // Move pill on route change
  useEffect(() => {
    if (activeIndex >= 0) {
      // Small delay so DOM has rendered
      const t = setTimeout(() => movePillToIndex(activeIndex), 50);
      return () => clearTimeout(t);
    }
  }, [activeIndex, location.pathname, movePillToIndex]);

  // Recalculate on resize
  useEffect(() => {
    const handleResize = () => {
      if (activeIndex >= 0) movePillToIndex(activeIndex);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex, movePillToIndex]);

  // ── Drag handlers ──────────────────────────────────────

  const handlePointerDown = useCallback((e, index) => {
    if (index !== activeIndex) return; // only drag the active pill
    dragStartX.current = e.clientX;
    dragCurrentX.current = e.clientX;

    // Lift after 150ms hold
    liftTimer.current = setTimeout(() => {
      setIsLifted(true);
    }, 150);

    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [activeIndex]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    dragCurrentX.current = e.clientX;
    const dx = e.clientX - dragStartX.current;

    // Move pill with drag
    setPillStyle(prev => ({
      ...prev,
      left: pillBaseLeft.current + dx,
    }));
  }, [isDragging]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return;
    clearTimeout(liftTimer.current);
    setIsDragging(false);
    setIsLifted(false);

    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) < 4) {
      // Tap, not drag — snap back
      movePillToIndex(activeIndex);
      return;
    }

    // Find nearest tab to drop position
    const dropX = e.clientX;
    let closestIndex = activeIndex;
    let closestDist = Infinity;

    tabRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(dropX - center);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });

    // Navigate to closest tab
    if (closestIndex !== activeIndex) {
      navigate(links[closestIndex].path);
    }
    movePillToIndex(closestIndex);
  }, [isDragging, activeIndex, movePillToIndex, navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4 md:px-6">
      {/* Floating Container */}
      <div
        className="max-w-7xl mx-auto rounded-[24px] overflow-hidden"
        style={{
  background: 'rgba(0,0,0,0)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
}}>
      {/* Main Navbar */}
        <div className="h-16 px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/feed"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0">
          <img src={logo} alt="Sportiva" className="w-8 h-8 object-contain" />
          <span className="text-lg font-black tracking-tight text-white">
            SPORT<span className="text-primary">IVA</span>
          </span>
        </Link>

        {/* Desktop links with liquid pill */}
        <div
          ref={navRef}
          className="hidden md:flex items-center gap-1 relative"
        >
          {/* Liquid glass pill — persistent, animates between tabs */}
          <div
            className="absolute top-0 bottom-0 rounded-xl pointer-events-none"
            style={{
              left: pillStyle.left,
              width: pillStyle.width,
              opacity: pillStyle.opacity,
              // Smooth slide when not dragging, instant when dragging
              transition: isDragging
                ? 'none'
                : 'left 0.35s cubic-bezier(0.34,1.56,0.64,1), width 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s',
              // Lift effect on hold
              transform: isLifted ? 'translateY(-3px) scaleY(1.15)' : 'translateY(0) scaleY(1)',
              transformOrigin: 'center',
              transitionProperty: isDragging ? 'transform' : 'left, width, opacity, transform',
              // Liquid glass appearance
              background: 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: isLifted
                ? '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.2)'
                : '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          />

          {links.map((link, index) => {
            const isActive = location.pathname === link.path;
            const isLive = link.path === '/live';
            return (
              <Link
                key={link.path}
                to={link.path}
                ref={el => tabRefs.current[index] = el}
                onPointerDown={(e) => handlePointerDown(e, index)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold
                            transition-colors duration-200 flex items-center gap-2
                            select-none touch-none
                            ${isActive ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
                style={{ zIndex: 1 }} // above the pill
              >
                <link.Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-white/35'
                  }`}
                />
                {link.label}
                {isLive && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isActive ? 'bg-live' : 'bg-white/30'
                    }`}
                    style={isActive ? { boxShadow: '0 0 6px #00E5A0' } : {}}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Logout */}
          <div className="hidden md:flex items-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-semibold
                         text-white/40 hover:text-white
                         border border-white/10 hover:border-white/20
                         transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
              }}
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

      {/* Mobile menu — pill not applicable here, standard highlight */}
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
                style={isActive ? {
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.08)'
                } : {}}
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
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold
                           text-white/40 hover:text-primary transition-colors"
              >
              Logout
            </button>
          </div>
        </div>
      )}
      </div>
    </nav>
  );
};

export default Navbar;