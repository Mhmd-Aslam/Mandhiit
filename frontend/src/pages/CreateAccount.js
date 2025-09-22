import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AvatarCropper from '../components/AvatarCropper';

export default function CreateAccount() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [cropToSquare, setCropToSquare] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cropOpen, setCropOpen] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState(null);

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) { setFile(null); setPreview(''); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
    // Open cropper immediately like WhatsApp
    setTimeout(() => setCropOpen(true), 0);
  };

  // Center-crop to 1:1 using canvas (no external deps)
  const cropImageToSquareBlob = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.width, h = img.height;
      const side = Math.min(w, h);
      const sx = Math.floor((w - side) / 2);
      const sy = Math.floor((h - side) / 2);
      const canvas = document.createElement('canvas');
      canvas.width = side; canvas.height = side;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, side, side, 0, 0, side, side);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob); else reject(new Error('Crop failed'));
      }, 'image/jpeg', 0.9);
    };
    img.onerror = reject;
    img.src = src;
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());

      if (file) {
        let avatarBlob = file;
        // Prefer user-cropped blob from modal if available
        if (croppedBlob) {
          avatarBlob = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
        } else if (cropToSquare && preview) {
          try {
            const blob = await cropImageToSquareBlob(preview);
            avatarBlob = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
          } catch (_) {
            // fallback to original file
          }
        }
        formData.append('avatar', avatarBlob);
      }

      const res = await api.post('/api/accounts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const user = res.data;
      setUser(user);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app py-10">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-slate-800">Account</h1>
        <p className="text-slate-500 mt-1">Set your name and display picture.</p>

        {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 input-base"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Display picture (optional)</label>
            <input type="file" accept="image/*" onChange={onFileChange} className="mt-1" />
            {preview && (
              <div className="mt-3 flex items-center gap-4">
                <img src={preview} alt="preview" className="w-20 h-20 object-cover rounded-lg ring-1 ring-slate-200" />
                <div className="flex items-center gap-3 text-sm">
                  <input id="cropSquare" type="checkbox" checked={cropToSquare} onChange={(e) => setCropToSquare(e.target.checked)} />
                  <label htmlFor="cropSquare" className="text-slate-700">Crop to 1:1 square</label>
                  <button type="button" className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200" onClick={() => setCropOpen(true)}>Edit</button>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </form>

        {cropOpen && preview && (
          <AvatarCropper
            src={preview}
            onCancel={() => setCropOpen(false)}
            onSave={(blob) => {
              setCroppedBlob(blob);
              // Update preview to cropped result
              const r = new FileReader();
              r.onload = () => setPreview(r.result);
              r.readAsDataURL(blob);
              setCropOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
