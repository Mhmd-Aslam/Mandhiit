import React, { useEffect, useRef } from 'react';
import api from '../services/api';

// Renders a Google Sign-In button using Google Identity Services (GIS)
// Requires both env vars:
// - Backend: GOOGLE_CLIENT_ID (used to verify id_token)
// - Frontend: REACT_APP_GOOGLE_CLIENT_ID (used by GIS)
export default function GoogleLoginButton({ onSuccess }) {
  const btnRef = useRef(null);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return; // silently ignore if not configured

    // Inject script once
    const existing = document.getElementById('google-identity-services');
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.id = 'google-identity-services';
      document.body.appendChild(s);
      s.onload = renderGoogleButton;
    } else {
      renderGoogleButton();
    }

    function renderGoogleButton() {
      /* global google */
      if (!window.google || !btnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          const id_token = response?.credential;
          if (!id_token) return;
          try {
            const res = await api.post('/auth/google/login', { id_token });
            if (onSuccess) onSuccess(res.data.user, res.data.access_token);
          } catch (e) {
            console.error('Google login failed', e);
          }
        },
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: 340,
      });
    }
  }, [clientId, onSuccess]);

  // Fallback button if no client id
  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white text-slate-700 px-4 py-2 cursor-not-allowed"
        title="Set REACT_APP_GOOGLE_CLIENT_ID to enable Google login"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.146,6.053,28.791,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.651,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,19.045,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.146,6.053,28.791,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c4.691,0,8.998-1.802,12.27-4.74l-5.657-5.657C28.595,35.091,26.393,36,24,36 c-5.202,0-9.619-3.317-11.275-7.952l-6.538,5.036C9.5,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.176-4.103,5.603l0.003-0.002l6.265,4.84 C36.862,39.835,40,32.5,40,24C40,22.651,39.862,21.35,43.611,20.083z"/></svg>
        Continue with Google
      </button>
    );
  }

  return <div ref={btnRef} className="flex justify-center" />;
}
