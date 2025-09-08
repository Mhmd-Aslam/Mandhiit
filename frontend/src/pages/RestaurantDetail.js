import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await axios.get(`/api/restaurants/${id}`);
        if (isMounted) setRestaurant(res.data);
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
      <div className="container-app py-16 text-center text-slate-600">Loading restaurant...</div>
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
          <p className="mt-1 text-white/90">{restaurant.type}</p>
        </div>
      </section>

      <section className="container-app py-10">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <img src={restaurant.image} alt={restaurant.name} className="w-full h-72 object-cover rounded-xl shadow" />
          </div>
          <div>
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-slate-800">Details</h2>
              <div className="mt-4 space-y-2">
                <p><span className="font-medium text-slate-600">Location:</span> {restaurant.location}</p>
                <p><span className="font-medium text-slate-600">Type:</span> {restaurant.type}</p>
                <p><span className="font-medium text-slate-600">Rating:</span> ⭐ {restaurant.rating}</p>
              </div>
              <button onClick={() => navigate(-1)} className="btn-primary mt-6">Back to list</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RestaurantDetail;
