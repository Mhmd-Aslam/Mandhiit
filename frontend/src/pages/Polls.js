import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const SAMPLE_POLL = {
  id: 'poll-weekly-kottayam-chicken',
  title: 'Best Chicken Mandhi in Kottayam (Weekly)',
  options: [
    { key: 'khaleef', label: 'Khaleef Mandi' },
    { key: 'albaike', label: 'Al Baike Mandhi Hub' },
    { key: 'ajwa', label: 'Ajwa Food Park' },
  ],
  // sample votes
  results: { khaleef: 132, albaike: 87, ajwa: 114 },
  ends_in: '3 days',
};

export default function Polls() {
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);

  const totals = useMemo(() => {
    const total = Object.values(SAMPLE_POLL.results).reduce((a, b) => a + b, 0) + (voted && selected ? 1 : 0);
    const byKey = { ...SAMPLE_POLL.results };
    if (voted && selected) byKey[selected] = (byKey[selected] || 0) + 1;
    const perc = Object.fromEntries(Object.entries(byKey).map(([k, v]) => [k, Math.round((v / total) * 100)]));
    return { total, byKey, perc };
  }, [selected, voted]);

  return (
    <div>
      <section className="bg-gradient-to-br from-amber-400 to-amber-600 text-white">
        <div className="container-app py-6 md:py-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Community Polls</h1>
          <p className="mt-2 text-white/90 max-w-2xl">Vote on the best Mandhi by city or type. No login required to view results.</p>
        </div>
      </section>
      <section className="container-app py-10">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-bold text-slate-800">{SAMPLE_POLL.title}</div>
              <div className="text-slate-500 text-sm mt-1">Ends in {SAMPLE_POLL.ends_in}</div>
            </div>
            <div className="text-xs text-slate-500">{totals.total} votes</div>
          </div>

          <div className="mt-6 grid gap-3">
            {SAMPLE_POLL.options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelected(opt.key)}
                className={`text-left p-3 rounded-lg border transition relative overflow-hidden ${selected === opt.key ? 'border-amber-300 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}
                disabled={voted}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{opt.label}</span>
                  <span className="text-sm text-slate-500">{totals.perc[opt.key] || 0}%</span>
                </div>
                <div className="mt-2 h-2 bg-slate-200 rounded-full">
                  <div className="h-2 bg-amber-500 rounded-full" style={{ width: `${totals.perc[opt.key] || 0}%` }} />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            {!voted ? (
              <button
                className="btn-primary"
                disabled={!selected}
                onClick={() => setVoted(true)}
              >
                Submit vote
              </button>
            ) : (
              <div className="text-amber-700 text-sm font-medium">Thanks for voting! Results updated.</div>
            )}
            <div className="text-xs text-slate-500">Sample data for demo purposes</div>
          </div>

          <div className="mt-6">
            <Link to="/" className="text-amber-600 hover:text-amber-700 font-medium">← Back to Home</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
