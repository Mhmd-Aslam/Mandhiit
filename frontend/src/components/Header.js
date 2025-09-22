import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Theme toggle is now handled inside HomePage hero; no need to import here

const Header = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const onLogout = async () => {
    // Simple local logout (no backend auth)
    logout();
    setOpen(false);
  };

  return (
    <>
    <header className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow">
      <div className="container-app py-1 md:py-4 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-base sm:text-lg md:text-2xl tracking-tight flex items-center gap-1 md:gap-2 leading-tight" onClick={() => setOpen(false)}>
          <span role="img" aria-label="plate">🍽️</span>
          <span>Mandhiit</span>
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-6">
            <li>
              <Link to="/" className="font-medium px-2 py-1 rounded-md hover:bg-white/10 hover:text-white transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/leaderboards" className="font-medium px-2 py-1 rounded-md hover:bg-white/10 hover:text-white transition-colors">Leaderboards</Link>
            </li>
            <li>
              <Link to="/polls" className="font-medium px-2 py-1 rounded-md hover:bg-white/10 hover:text-white transition-colors">Polls</Link>
            </li>
            
            {!user ? (
              <li>
                <Link to="/account" className="bg-white text-amber-700 hover:bg-white/90 font-semibold px-3 py-1.5 rounded-md transition">
                  Account
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/profile" className="flex items-center gap-3 px-2 py-1 rounded-md hover:bg-white/10 hover:text-white transition-colors">
                    <span className="hidden sm:inline text-white/90 font-medium">Hi, {user.name || user.email}</span>
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=f59e0b&color=fff&size=64&rounded=true`}
                      alt="avatar"
                      className="w-8 h-8 rounded-full ring-2 ring-white/40"
                    />
                  </Link>
                </li>
                <li>
                  <button onClick={onLogout} className="bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-md transition">Logout</button>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/15 hover:bg-white/25"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/15 bg-amber-600/95 backdrop-blur">
          <div className="container-app py-1">
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/" className="block py-1 font-medium rounded-md px-2 hover:bg-white/20 transition-colors text-xs" onClick={() => setOpen(false)}>Home</Link>
              </li>
              <li>
                <Link to="/leaderboards" className="block py-1 font-medium rounded-md px-2 hover:bg-white/20 transition-colors text-xs" onClick={() => setOpen(false)}>Leaderboards</Link>
              </li>
              <li>
                <Link to="/polls" className="block py-1 font-medium rounded-md px-2 hover:bg-white/20 transition-colors text-xs" onClick={() => setOpen(false)}>Polls</Link>
              </li>
              
              {!user ? (
                <li>
                  <Link to="/account" className="block py-1 font-medium rounded-md px-2 hover:bg-white/20 transition-colors text-xs" onClick={() => setOpen(false)}>
                    Account
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/profile" className="flex items-center gap-2 py-1 rounded-md px-2 hover:bg-white/20 transition-colors text-xs" onClick={() => setOpen(false)}>
                      <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=f59e0b&color=fff&size=64&rounded=true`}
                        alt="avatar"
                        className="w-6 h-6 rounded-full ring-2 ring-white/40"
                      />
                      <span className="font-medium">{user.name || user.email}</span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={onLogout} className="w-full text-left bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-md transition text-xs">Logout</button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
    </>
  );
};

export default Header;
