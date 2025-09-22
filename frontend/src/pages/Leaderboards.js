import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Use the same source as HomePage: GET /api/restaurants

export default function Leaderboards() {
  const [city, setCity] = useState('all');
  const [meat, setMeat] = useState('all');
  const [sort, setSort] = useState('score');
  const [raw, setRaw] = useState([]); // fetched restaurants

  // Load restaurants from the same API as HomePage
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get('/api/restaurants');
        if (mounted) setRaw(res.data || []);
      } catch (e) {
        if (mounted) setRaw([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Normalize into the shape Leaderboards expects
  const SOURCE = useMemo(() => (raw || []).map((r, idx) => ({
    id: r.id,
    name: r.name,
    city: r.location,            // show the same location string
    type: r.type,                // e.g., Hyderabadi Cuisine
    avg_rating: r.avg_rating ?? r.rating ?? 0,
    review_count: r.review_count ?? 0,
    image: r.image,
    // score computed later
  })), [raw]);

  const list = useMemo(() => {
    const filtered = SOURCE.filter((r) => (
      (city === 'all' || r.city.toLowerCase() === city) &&
      (meat === 'all' || r.type.toLowerCase() === meat)
    ));
    // Weighted score: 80% rating, 20% normalized review count
    const maxReviews = Math.max(1, ...filtered.map((r) => r.review_count));
    const withScore = filtered.map((r) => ({
      ...r,
      score: Math.round(((r.avg_rating / 5) * 0.8 + (r.review_count / maxReviews) * 0.2) * 1000) / 1000,
    }));
    const sorted = [...withScore].sort((a, b) => {
      if (sort === 'reviews') return b.review_count - a.review_count;
      if (sort === 'rating') return b.avg_rating - a.avg_rating;
      return b.score - a.score;
    });
    return sorted.slice(0, 10);
  }, [city, meat, sort, SOURCE]);

  const Medal = ({ rank }) => {
    const styles = [
      'bg-yellow-400 text-yellow-900',
      'bg-gray-300 text-gray-800',
      'bg-orange-300 text-orange-900',
    ];
    const s = styles[rank - 1] || 'bg-slate-200 text-slate-700';
    return <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${s}`}>{rank}</span>;
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-amber-400 to-amber-600 text-white">
        <div className="container-app py-4 md:py-10">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Leaderboards</h1>
          <p className="mt-1.5 text-white/90 max-w-2xl">Top-rated restaurants by city and type. Public and shareable.</p>
        </div>
      </section>
      <section className="container-app py-10">
        <div className="bg-white dark:bg-[#2f3031] rounded-xl shadow dark:shadow-none ring-1 ring-slate-200 dark:ring-[#555] p-6">
          <div className="flex flex-wrap items-center gap-3">
            <select className="input-base w-full sm:w-auto" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="all">All Cities</option>
              <option value="kottayam">Kottayam</option>
              <option value="erattupetta">Erattupetta</option>
              <option value="pala">Pala</option>
              <option value="thalayolaparambu">Thalayolaparambu</option>
              <option value="kuravilangadu">Kuravilangadu</option>
              <option value="athirampuzha">Athirampuzha</option>
            </select>
            <select className="input-base w-full sm:w-auto" value={meat} onChange={(e) => setMeat(e.target.value)}>
              <option value="all">All Types</option>
              <option value="chicken">Chicken</option>
              <option value="mutton">Mutton</option>
              <option value="beef">Beef</option>
            </select>
            <select className="input-base w-full sm:w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="score">Sort: Weighted score</option>
              <option value="rating">Sort: Rating</option>
              <option value="reviews">Sort: Reviews</option>
            </select>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r, idx) => (
              <div key={r.id} className="group relative bg-white dark:bg-[#2f3031] rounded-xl overflow-hidden shadow dark:shadow-none ring-1 ring-slate-200 dark:ring-[#555]">
                <div className="absolute left-3 top-3 z-10"><Medal rank={idx + 1} /></div>
                <img src={r.image} alt={r.name} className="w-full h-40 object-cover group-hover:scale-[1.01] transition" />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{r.name}</h3>
                    <span className="text-sm text-slate-500 dark:text-gray-300">{r.city}</span>
                  </div>
                  <div className="mt-1 text-amber-700 font-medium">{r.type}</div>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-1 dark:ring-amber-400/40">
                      ⭐ {r.avg_rating.toFixed(1)}
                    </div>
                    <div className="text-slate-500 dark:text-gray-300">{r.review_count} reviews</div>
                    <div className="ml-auto text-slate-700 dark:text-white font-semibold">Score {r.score.toFixed(3)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-gray-300">
            <span>Sample data for demo purposes</span>
            <Link to="/" className="text-amber-600 hover:text-amber-700 font-medium">← Back to Home</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
