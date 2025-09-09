import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GoogleLoginButton from './GoogleLoginButton';

const Header = () => {
  const { user, logout, token, setUser, setToken } = useAuth();

  const onLogout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      logout();
    }
  };

  return (
    <header className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow">
      <div className="container-app py-4 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-xl md:text-2xl tracking-tight flex items-center gap-2">
          <span role="img" aria-label="plate">🍽️</span>
          <span>Best Mandhi in Town</span>
        </Link>
        <nav>
          <ul className="flex items-center gap-6">
            <li>
              <Link to="/" className="hover:text-white/90 font-medium">Home</Link>
            </li>
            <li>
              <Link to="/leaderboards" className="hover:text-white/90 font-medium">Leaderboards</Link>
            </li>
            <li>
              <Link to="/polls" className="hover:text-white/90 font-medium">Polls</Link>
            </li>
            {!user ? (
              <li>
                <GoogleLoginButton onSuccess={(u, tok) => { setUser(u); setToken(tok); }} />
              </li>
            ) : (
              <>
                <li>
                  <Link to="/profile" className="flex items-center gap-3 hover:text-white/90">
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
      </div>
    </header>
  );
};

export default Header;
