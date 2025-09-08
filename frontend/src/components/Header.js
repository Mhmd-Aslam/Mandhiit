import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GoogleLoginButton from './GoogleLoginButton';

const Header = () => {
  const { user, logout, token } = useAuth();

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
            {!user ? (
              <li>
                <GoogleLoginButton onSuccess={() => { /* AuthContext will be set inside page components; header stays simple */ }} />
              </li>
            ) : (
              <>
                <li className="text-white/90 font-medium">Hi, {user.name || user.email}</li>
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
