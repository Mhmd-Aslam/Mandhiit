import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import GoogleLoginButton from '../components/GoogleLoginButton';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [files, setFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // object URLs

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await axios.get(`/api/restaurants/${id}`);
        if (isMounted) setRestaurant(res.data);
        const rv = await axios.get(`/api/restaurants/${id}/reviews`);
        if (isMounted) setReviews(rv.data || []);
        const ph = await axios.get(`/api/restaurants/${id}/photos`);
        if (isMounted) setPhotos(ph.data || []);
      } catch (e) {
        console.error(e);
        if (isMounted) setError('Restaurant not found.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="container-app py-16 text-center text-slate-600 dark:text-white">Loading restaurant...</div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container-app py-16">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error || 'Restaurant not found.'}</p>
          <button onClick={() => navigate(-1)} className="btn-primary mt-4">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-amber-400 to-amber-600 text-white">
        <div className="container-app py-10">
          <button onClick={() => navigate(-1)} className="text-white/90 hover:text-white">← Back</button>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">{restaurant.name}</h1>
          <div className="mt-1 flex items-center gap-3 text-white/90">
            <p>{restaurant.type}</p>
            <span className="inline-flex items-center gap-1 text-white bg-black/20 px-2 py-1 rounded-full text-sm">
              <span>⭐</span>
              <span>{restaurant.avg_rating ?? restaurant.rating}</span>
              {typeof restaurant.review_count === 'number' && (
                <span className="opacity-80">({restaurant.review_count})</span>
              )}
            </span>
          </div>
        </div>
      </section>

      <section className="container-app py-10">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <img src={restaurant.image} alt={restaurant.name} className="w-full h-72 object-cover rounded-xl shadow" />
          </div>
          <div>
            <div className="bg-white dark:bg-[#2f3031] rounded-xl shadow dark:shadow-none ring-1 ring-slate-200 dark:ring-[#555] p-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Details</h2>
              <div className="mt-4 space-y-2">
                <p><span className="font-medium text-slate-600 dark:text-gray-300">Location:</span> <span className="dark:text-white">{restaurant.location}</span></p>
                <p><span className="font-medium text-slate-600 dark:text-gray-300">Type:</span> <span className="dark:text-white">{restaurant.type}</span></p>
                <p>
                  <span className="font-medium text-slate-600 dark:text-gray-300">Rating:</span>{' '}
                  <span className="dark:text-white">⭐ {restaurant.avg_rating ?? restaurant.rating}</span>
                  {typeof restaurant.review_count === 'number' && (
                    <span className="text-slate-500 dark:text-gray-300"> ({restaurant.review_count})</span>
                  )}
                </p>
              </div>
              <button onClick={() => navigate(-1)} className="btn-primary mt-6">Back to list</button>
            </div>
          </div>
        </div>

        {/* Other dishes mention (non-Mandhi) */}
        {Array.isArray(restaurant.specialties) && (
          (() => {
            const others = restaurant.specialties.filter((s) => !/mandhi/i.test(String(s)));
            if (!others.length) return null;
            return (
              <div className="mt-10 bg-white dark:bg-[#2f3031] rounded-xl shadow dark:shadow-none ring-1 ring-slate-200 dark:ring-[#555] p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Also on the menu</h3>
                <p className="text-slate-600 dark:text-gray-300 mt-1">Besides Mandhi, you can also try:</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {others.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm dark:bg-amber-500/15 dark:text-amber-200 dark:ring-1 dark:ring-amber-400/40">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()
        )}
      </section>

      {/* Reviews Section */}
      <section className="container-app pb-14">
        <div className="bg-white dark:bg-[#2f3031] rounded-xl shadow dark:shadow-none ring-1 ring-slate-200 dark:ring-[#555] p-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Reviews</h3>

          {/* Add review: inputs are always visible. If not logged in, clicking stars or submit triggers Google sign-in. */}
          <div className="mt-4">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user) {
                  setShowLoginPrompt(true);
                  return;
                }
                setSubmitting(true);
                try {
                  let res;
                  if (files.length > 0) {
                    const formData = new FormData();
                    formData.append('rating', String(formRating || 0));
                    formData.append('comment', formComment || '');
                    files.forEach((f) => formData.append('photos', f));
                    res = await api.post(`/api/restaurants/${id}/reviews`, formData, {
                      headers: { 'Content-Type': 'multipart/form-data' },
                    });
                  } else {
                    res = await api.post(`/api/restaurants/${id}/reviews`, {
                      rating: formRating,
                      comment: formComment,
                    });
                  }
                  setReviews((r) => [res.data, ...r]);
                  if (res.data?.photos?.length) {
                    setPhotos((p) => [...res.data.photos, ...p]);
                  }
                  setFormRating(5);
                  setFormComment('');
                  setFiles([]);
                  setPreviews((prev) => {
                    prev.forEach((u) => URL.revokeObjectURL(u));
                    return [];
                  });
                } catch (err) {
                  alert(err?.response?.data?.error || 'Failed to submit review');
                } finally {
                  setSubmitting(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Your rating</label>
                <StarRating
                  value={formRating}
                  onChange={(v) => {
                    if (!user) {
                      setShowLoginPrompt(true);
                      return;
                    }
                    setFormRating(v);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Your review (optional)</label>
                <textarea
                  className="mt-1 textarea-base"
                  rows={3}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Share your Mandhi experience..."
                />
              </div>
              {/* Photo upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Add photos (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-1 input-base py-2"
                  onChange={(e) => {
                    const fl = Array.from(e.target.files || []);
                    setFiles(fl);
                    // previews
                    setPreviews((prev) => {
                      prev.forEach((u) => URL.revokeObjectURL(u));
                      return fl.map((f) => URL.createObjectURL(f));
                    });
                  }}
                />
                {previews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img src={src} alt={`preview-${idx}`} className="w-full h-20 object-cover rounded-md ring-1 ring-slate-200 dark:ring-[#555]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button disabled={submitting} className="btn-primary">{submitting ? 'Submitting...' : 'Submit review'}</button>
            </form>

            {/* Login modal is handled below; keep DOM clean here */}
          </div>

          {/* List reviews */}
          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-slate-500 dark:text-gray-300 text-sm">No reviews yet. Be the first to review this Mandhi spot!</p>
            ) : (
              reviews.map((rv) => (
                <div key={rv.id} className="border border-slate-200 dark:border-[#555] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-slate-800 dark:text-white">{rv.user_name || 'User'}</div>
                    <StarRating value={rv.rating} readOnly small />
                  </div>
                  {rv.comment && <p className="text-slate-700 dark:text-gray-200 mt-2">{rv.comment}</p>}
                  <div className="text-xs text-slate-400 dark:text-gray-400 mt-2">{new Date(rv.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <section className="container-app pb-12">
          <div className="bg-white dark:bg-[#2f3031] rounded-xl shadow dark:shadow-none ring-1 ring-slate-200 dark:ring-[#555] p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Photos</h3>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {photos.map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="block">
                  <img src={p.url} alt="review" className="w-full h-28 object-cover rounded-md ring-1 ring-slate-200 dark:ring-[#555] hover:opacity-95" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Login Modal */}
      {showLoginPrompt && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLoginPrompt(false)} />
          <div className="relative bg-white dark:bg-[#2f3031] rounded-xl shadow-xl dark:shadow-none ring-1 ring-slate-200 dark:ring-[#555] w-full max-w-md mx-4 p-6">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">Sign in to continue</h4>
            <p className="text-slate-600 dark:text-gray-300 mt-1">Use your Google account to rate and review this Mandhi spot.</p>
            <div className="mt-4 flex justify-center">
              <GoogleLoginButton onSuccess={() => { window.location.reload(); }} />
            </div>
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-[#555] dark:text-white dark:hover:bg-white/10" onClick={() => setShowLoginPrompt(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
;

export default RestaurantDetail;
