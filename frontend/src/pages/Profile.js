import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';
import api from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, token, setUser, setToken, logout } = useAuth();

  const handleLogout = async () => {
    try {
      if (token) await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      logout();
      navigate('/');
    }
  };

  if (!user) {
    return (
      <div className="container-app py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Your Profile</h1>
          <p className="text-slate-500 mt-1">Sign in to view your profile, reviews, and badges.</p>
          <div className="mt-6">
            <GoogleLoginButton onSuccess={(u, tok) => { setUser(u); setToken(tok); navigate('/profile'); }} />
          </div>
          <p className="text-sm text-slate-600 mt-6">
            Prefer email? <Link to="/login" className="text-amber-600 hover:text-amber-700 font-medium">Log in</Link>
          </p>
        </div>
      </div>
    );
  }

  const displayName = user.name || (user.email ? user.email.split('@')[0] : 'User');
  const avatar = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f59e0b&color=fff&size=128&rounded=true`;

  return (
    <div className="container-app py-10">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <img src={avatar} alt={displayName} className="w-24 h-24 rounded-full mx-auto ring-2 ring-amber-300" />
            <h2 className="mt-3 text-xl font-bold text-slate-800">{displayName}</h2>
            {user.email && <p className="text-slate-600 text-sm">{user.email}</p>}
            <button onClick={handleLogout} className="btn-primary mt-4 w-full justify-center">Logout</button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-slate-800">Badges</h3>
            <p className="text-slate-600 text-sm mt-1">Earn badges by contributing reviews and photos.</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 text-center text-slate-600">No badges yet</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h3 className="text-lg font-bold text-slate-800">Your Activity</h3>
            <p className="text-slate-600 text-sm mt-1">Coming soon: your recent reviews, likes, and photos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
