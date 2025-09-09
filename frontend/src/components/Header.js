import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GoogleLoginButton from './GoogleLoginButton';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { user, logout, token, setUser, setToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const onLogout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      logout();
      setOpen(false);
    }
  };

  return (
    <>
    <header className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow">
      <div className="container-app py-1 md:py-4 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-base sm:text-lg md:text-2xl tracking-tight flex items-center gap-1 md:gap-2 leading-tight" onClick={() => setOpen(false)}>
          <span role="img" aria-label="plate">🍽️</span>
          <span>Best Mandhi in Town</span>
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
                <GoogleLoginButton onSuccess={(u, tok) => { setUser(u); setToken(tok); }} />
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
                  <div className="py-1">
                    <GoogleLoginButton onSuccess={(u, tok) => { setUser(u); setToken(tok); setOpen(false); }} />
                  </div>
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
    {/* Floating dark mode toggle */}
    {/* Floating theme toggle with label underneath */}
    <div className="theme-toggle-wrap fixed top-20 right-3 md:top-24 md:right-6 z-50 flex flex-col items-center gap-1 select-none">
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-full bg-white text-amber-700 hover:bg-amber-50 shadow-xl ring-1 ring-black/10 dark:bg-[#2f3031] dark:text-white dark:hover:bg-[#3a3b3c] dark:ring-white/30 p-2 md:p-3 lg:p-4 transition transform hover:scale-105"
        aria-label="Toggle dark mode"
        title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
      >
        <span className="text-lg md:text-xl lg:text-2xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
        <span className="sr-only">Toggle theme</span>
      </button>
      <span className="px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-md text-[10px] sm:text-xs md:text-sm font-medium bg-black/20 text-white dark:bg-white/10 dark:text-white shadow">
        {theme === 'dark' ? 'Dark' : 'Light'}
      </span>
    </div>
    </>
  );
};

export default Header;
