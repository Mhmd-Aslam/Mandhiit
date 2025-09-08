import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RestaurantCard from '../components/RestaurantCard';

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await axios.get('/api/restaurants');
        if (isMounted) {
          setRestaurants(res.data || []);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setError('Failed to load restaurants. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-400 to-amber-600 text-white">
        <div className="container-app py-16">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Best Mandhi in Town</h1>
          <p className="mt-3 text-white/90 max-w-2xl">
            Discover the finest mandhi spots around you. Curated lists, beautiful photos,
            and delicious experiences await.
          </p>
        </div>
      </section>

      {/* List */}
      <section className="container-app py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Top Picks</h2>
          <a href="#" className="text-amber-600 hover:text-amber-700 font-medium">View all</a>
        </div>
        {loading && (
          <div className="mt-8 text-center text-slate-600">Loading restaurants...</div>
        )}
        {error && (
          <div className="mt-8 text-center text-red-600">{error}</div>
        )}
        {!loading && !error && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
