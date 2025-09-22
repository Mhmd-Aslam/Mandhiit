import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AvatarCropper from '../components/AvatarCropper';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(() => user?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cropOpen, setCropOpen] = useState(false);
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);
  const [userReviews, setUserReviews] = useState([]);
  const [savedRestaurants, setSavedRestaurants] = useState([]);

  const handleLogout = async () => {
    // No backend auth needed for simple project; just clear locally
    logout();
    navigate('/');
  };

  useEffect(() => {
    // Load user reviews
    (async () => {
      try {
        if (!user?.id) return;
        const res = await api.get(`/api/accounts/${user.id}/reviews`);
        setUserReviews(res.data || []);
      } catch (e) {
        // ignore
      }
    })();
    // Load saved spots from localStorage and resolve into restaurant details
    (async () => {
      try {
        const key = `bm_saved_${user?.id}`;
        const ids = JSON.parse(localStorage.getItem(key) || '[]');
        if (!Array.isArray(ids) || ids.length === 0) { setSavedRestaurants([]); return; }
        const all = await api.get('/api/restaurants');
        const list = (all.data || []).filter((r) => ids.includes(r.id));
        setSavedRestaurants(list);
      } catch (e) {
        setSavedRestaurants([]);
      }
    })();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="container-app py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Your Profile</h1>
          <p className="text-slate-500 mt-1">Create a simple profile with your name and an optional picture.</p>
          <div className="mt-6">
            <Link to="/account" className="btn-primary inline-flex items-center justify-center">
              Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.name || 'User';
  const avatar = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f59e0b&color=fff&size=256&rounded=true`;

  const onPickPhoto = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setPreview(reader.result); setCropOpen(true); };
    reader.readAsDataURL(f);
  };

  const saveName = async () => {
    if (!name.trim()) return;
    setSaving(true); setError('');
    try {
      const res = await api.patch(`/api/accounts/${user.id}`, { name: name.trim() });
      setUser(res.data);
      setEditingName(false);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const saveAvatar = async (blob) => {
    setSaving(true); setError('');
    try {
      const form = new FormData();
      form.append('avatar', new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
      const res = await api.patch(`/api/accounts/${user.id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(res.data);
      setCropOpen(false);
      setPreview('');
      // done
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update photo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-app py-10">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-[#2f3031] rounded-xl shadow dark:shadow-none ring-1 ring-slate-200 dark:ring-[#555] p-6 text-center">
            <div className="relative w-32 h-32 mx-auto">
              <img src={avatar} alt={displayName} className="w-32 h-32 rounded-full mx-auto ring-2 ring-amber-300 object-cover" />
              <button
                onClick={onPickPhoto}
                className="absolute bottom-0 right-0 bg-amber-600 text-white rounded-full p-2 shadow hover:bg-amber-700"
                title="Change photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 5c-3.86 0-7 3.14-7 7 0 3.861 3.14 7 7 7 3.861 0 7-3.139 7-7 0-3.86-3.139-7-7-7Zm0-2c4.971 0 9 4.029 9 9 0 4.971-4.029 9-9 9-4.971 0-9-4.029-9-9 0-4.971 4.029-9 9-9Zm1 4h-2v3H8v2h3v3h2v-3h3v-2h-3V7Z"/></svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </div>
            <div className="mt-4">
              {editingName ? (
                <div className="flex items-center justify-center gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input-base w-48 text-center dark:bg-[#262728] dark:text-white" />
                  <button disabled={saving} onClick={saveName} className="px-3 py-1.5 rounded-md bg-amber-600 text-white hover:bg-amber-700">Save</button>
                  <button onClick={() => { setEditingName(false); setName(user.name || ''); }} className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">Cancel</button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{displayName}</h2>
                  <button onClick={() => setEditingName(true)} className="mt-1 text-amber-700 hover:text-amber-800 text-sm">Edit name</button>
                </>
              )}
            </div>
            {error && <div className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</div>}
            <button onClick={handleLogout} className="btn-primary mt-6 w-full justify-center">Logout</button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-[#2f3031] rounded-xl shadow dark:shadow-none ring-1 ring-slate-200 dark:ring-[#555] p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">About</h3>
            <div className="mt-3 space-y-3 text-slate-700 dark:text-gray-200">
              <div className="flex items-center justify-between"><span className="text-slate-500 dark:text-gray-400">Name</span><span className="font-medium dark:text-white">{user.name}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500 dark:text-gray-400">ID</span><span className="font-mono text-sm break-all dark:text-white/90">{user.id}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500 dark:text-gray-400">Member since</span><span className="dark:text-white/90">{new Date(user.created_at).toLocaleDateString()}</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#2f3031] rounded-xl shadow dark:shadow-none ring-1 ring-slate-200 dark:ring-[#555] p-6 mt-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Review histories</h3>
            {userReviews.length === 0 ? (
              <p className="text-slate-600 dark:text-gray-300 text-sm mt-1">No reviews yet.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {userReviews.map((rv) => (
                  <div key={rv.id} className="border border-slate-200 dark:border-[#555] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-slate-800 dark:text-white">{rv.restaurant_id ? `#${rv.restaurant_id}` : 'Restaurant'}</div>
                      <div className="text-sm dark:text-gray-200">⭐ {rv.rating}</div>
                    </div>
                    {rv.comment && <div className="text-slate-700 dark:text-gray-200 text-sm mt-1">{rv.comment}</div>}
                    <div className="text-xs text-slate-400 dark:text-gray-400 mt-1">{new Date(rv.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#2f3031] rounded-xl shadow dark:shadow-none ring-1 ring-slate-200 dark:ring-[#555] p-6 mt-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Saved</h3>
            {savedRestaurants.length === 0 ? (
              <p className="text-slate-600 dark:text-gray-300 text-sm mt-1">No saved Mandhi spots yet.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedRestaurants.map((r) => (
                  <Link key={r.id} to={`/restaurant/${r.id}`} className="block border border-slate-200 dark:border-[#555] rounded-lg overflow-hidden">
                    <img src={r.image} alt={r.name} className="w-full h-28 object-cover" />
                    <div className="p-3">
                      <div className="font-semibold text-slate-800 dark:text-white">{r.name}</div>
                      <div className="text-sm text-slate-600 dark:text-gray-300">{r.location}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {cropOpen && preview && (
        <AvatarCropper
          src={preview}
          onCancel={() => setCropOpen(false)}
          onSave={(blob) => saveAvatar(blob)}
        />
      )}
    </div>
  );
}
