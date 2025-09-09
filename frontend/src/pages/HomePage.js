import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import RestaurantCard from '../components/RestaurantCard';
import { useSearchParams } from 'react-router-dom';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const initialMeats = (searchParams.get('meats') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .reduce((acc, m) => ({ ...acc, [m.charAt(0).toUpperCase() + m.slice(1)]: true }), {});
  const [types, setTypes] = useState({ Chicken: false, Mutton: false, Beef: false, Fish: false, ...initialMeats });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const filtersBtnRef = useRef(null);
  const sortBtnRef = useRef(null);
  const filtersRef = useRef(null);
  const sortRef = useRef(null);

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

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClick = (e) => {
      const t = e.target;
      const inFilters = filtersRef.current && filtersRef.current.contains(t);
      const onFiltersBtn = filtersBtnRef.current && filtersBtnRef.current.contains(t);
      const inSort = sortRef.current && sortRef.current.contains(t);
      const onSortBtn = sortBtnRef.current && sortBtnRef.current.contains(t);
      if (!inFilters && !onFiltersBtn) setShowFilters(false);
      if (!inSort && !onSortBtn) setShowSort(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setShowFilters(false);
        setShowSort(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const activeMeats = useMemo(
    () => Object.entries(types).filter(([, v]) => v).map(([k]) => k.toLowerCase()),
    [types]
  );

  const filtered = useMemo(() => restaurants.filter((r) => {
    const q = query.trim().toLowerCase();
    const name = (r.name || '').toLowerCase();
    const city = (r.location || '').toLowerCase();
    const specialties = Array.isArray(r.specialties) ? r.specialties.join(' ').toLowerCase() : '';
    const matchesQuery = q === '' || name.includes(q) || city.includes(q) || specialties.includes(q);

    if (activeMeats.length === 0) return matchesQuery;
    // meat filter: check specialties contain the meat keyword
    const specArr = Array.isArray(r.specialties) ? r.specialties : [];
    const specText = specArr.map((s) => String(s).toLowerCase());
    const meatMatch = activeMeats.some((meat) => specText.some((s) => s.includes(meat)));
    return matchesQuery && meatMatch;
  }), [restaurants, query, activeMeats]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sortBy) {
      case 'rating_desc':
        copy.sort((a, b) => (b.avg_rating ?? b.rating ?? 0) - (a.avg_rating ?? a.rating ?? 0));
        break;
      case 'rating_asc':
        copy.sort((a, b) => (a.avg_rating ?? a.rating ?? 0) - (b.avg_rating ?? b.rating ?? 0));
        break;
      case 'reviews_desc':
        copy.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
        break;
      case 'name_asc':
        copy.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
        copy.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default:
        break;
    }
    return copy;
  }, [filtered, sortBy]);

  // Keep URL in sync with query/filters/sort
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (activeMeats.length) params.set('meats', activeMeats.join(','));
    if (sortBy && sortBy !== 'rating_desc') params.set('sort', sortBy);
    setSearchParams(params);
  }, [query, activeMeats, sortBy, setSearchParams]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-400 to-amber-600 text-white">
        <div className="container-app py-8 md:py-16">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Best Mandhi in Town</h1>
          <p className="mt-3 text-white/90 max-w-2xl">
            Discover the finest mandhi spots around you. Curated lists, beautiful photos,
            and delicious experiences await.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/leaderboards" className="inline-flex items-center gap-2 bg-white text-amber-700 hover:bg-amber-50 font-medium px-4 py-2 rounded-md shadow">
              🏆 Explore Leaderboards
            </a>
            <a href="/polls" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-md ring-1 ring-white/30">
              🗳️ Vote in Polls
            </a>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="container-app py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Top Mandhi Spots</h2>
          <a href="#" className="text-amber-600 hover:text-amber-700 font-medium">View all</a>
        </div>

        {/* Search & Top Controls */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center gap-4 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, or dish (e.g., Chicken Mandhi)"
            className="input-base md:flex-1"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-3 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={() => { setShowFilters((v) => !v); setShowSort(false); }}
              ref={filtersBtnRef}
            >
              Filters
              {activeMeats.length ? <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{activeMeats.length}</span> : null}
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={() => { setShowSort((v) => !v); setShowFilters(false); }}
              ref={sortBtnRef}
            >
              {(() => {
                const map = {
                  rating_desc: 'Rating (high → low)',
                  rating_asc: 'Rating (low → high)',
                  reviews_desc: 'Most reviewed',
                  name_asc: 'Name (A → Z)',
                  name_desc: 'Name (Z → A)'
                };
                return `Sort: ${map[sortBy] || 'Rating (high → low)'}`;
              })()}
            </button>
          </div>

          {/* Filters Dropdown */}
          {showFilters && (
            <div ref={filtersRef} className="dropdown-panel absolute z-20 mt-2 md:mt-12 right-28 md:right-28 bg-white border border-slate-300 rounded-lg shadow-lg w-full md:w-80 p-4">
              <div className="font-semibold text-slate-800 mb-3">Filter by Type</div>
              <div className="grid grid-cols-2 gap-2">
                {['Chicken', 'Mutton', 'Beef', 'Fish'].map((m) => (
                  <label key={m} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${types[m] ? 'bg-amber-50 border-amber-300 text-amber-800' : 'border-slate-300 text-slate-700'}`}>
                    <input
                      type="checkbox"
                      className="accent-amber-600"
                      checked={types[m]}
                      onChange={(e) => setTypes((prev) => ({ ...prev, [m]: e.target.checked }))}
                    />
                    {m}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  className="px-3 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => setTypes({ Chicken: false, Mutton: false, Beef: false, Fish: false })}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowFilters(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Sort Dropdown */}
          {showSort && (
            <div ref={sortRef} className="dropdown-panel absolute z-20 mt-2 md:mt-12 right-0 bg-white border border-slate-300 rounded-lg shadow-lg w-full md:w-64 p-2">
              {[
                { v: 'rating_desc', l: 'Rating (high → low)' },
                { v: 'rating_asc', l: 'Rating (low → high)' },
                { v: 'reviews_desc', l: 'Most reviewed' },
                { v: 'name_asc', l: 'Name (A → Z)' },
                { v: 'name_desc', l: 'Name (Z → A)' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => { setSortBy(opt.v); setShowSort(false); }}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 ${sortBy === opt.v ? 'bg-amber-50 text-amber-800' : 'text-slate-700'}`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results meta */}
        {!loading && !error && (
          <div className="mt-4 text-sm text-slate-600">Showing {filtered.length} of {restaurants.length} places</div>
        )}

        {loading && (
          <div className="mt-8 text-center text-slate-600">Loading restaurants...</div>
        )}
        {error && (
          <div className="mt-8 text-center text-red-600">{error}</div>
        )}
        {!loading && !error && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
