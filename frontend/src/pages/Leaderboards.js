import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const SAMPLE = [
  { id: 1, name: 'Khaleef Mandi', city: 'Kottayam', type: 'Chicken', avg_rating: 4.6, review_count: 214, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=640' },
  { id: 2, name: 'Al Baike Mandhi Hub', city: 'Erattupetta', type: 'Chicken', avg_rating: 4.3, review_count: 128, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=640' },
  { id: 3, name: 'Ajwa Food Park', city: 'Pala', type: 'Chicken', avg_rating: 4.2, review_count: 162, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=640' },
  { id: 4, name: 'Al Ajmi Yemen Mandi', city: 'Erattupetta', type: 'Mutton', avg_rating: 4.4, review_count: 97, image: 'https://images.unsplash.com/photo-1550547660-acef4926b7f8?w=640' },
  { id: 5, name: 'Ikkannte Manthikada', city: 'Thalayolaparambu', type: 'Chicken', avg_rating: 4.5, review_count: 201, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=640' },
  { id: 6, name: 'Majlis Yemen Mandi', city: 'Kuravilangadu', type: 'Beef', avg_rating: 4.1, review_count: 88, image: 'https://images.unsplash.com/photo-1604908554233-95e2e2ac43d8?w=640' },
  { id: 7, name: 'Moopans Restaurant', city: 'Athirampuzha', type: 'Chicken', avg_rating: 4.0, review_count: 133, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=640' },
];

export default function Leaderboards() {
  const [city, setCity] = useState('all');
  const [meat, setMeat] = useState('all');
  const [sort, setSort] = useState('score');

  const list = useMemo(() => {
    const filtered = SAMPLE.filter((r) => (
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
  }, [city, meat, sort]);

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
        <div className="bg-white rounded-xl shadow p-6">
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
              <div key={r.id} className="group relative bg-white rounded-xl overflow-hidden shadow ring-1 ring-slate-200">
                <div className="absolute left-3 top-3 z-10"><Medal rank={idx + 1} /></div>
                <img src={r.image} alt={r.name} className="w-full h-40 object-cover group-hover:scale-[1.01] transition" />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">{r.name}</h3>
                    <span className="text-sm text-slate-500">{r.city}</span>
                  </div>
                  <div className="mt-1 text-amber-700 font-medium">{r.type} Mandhi</div>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-800">
                      ⭐ {r.avg_rating.toFixed(1)}
                    </div>
                    <div className="text-slate-500">{r.review_count} reviews</div>
                    <div className="ml-auto text-slate-700 font-semibold">Score {r.score.toFixed(3)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <span>Sample data for demo purposes</span>
            <Link to="/" className="text-amber-600 hover:text-amber-700 font-medium">← Back to Home</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
