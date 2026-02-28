'use client';

import { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { GlassCard } from '../../components/GlassCard';
import { submitFeedback } from '../../lib/api';

export default function FeedbackPage() {
  const [contentId, setContentId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await submitFeedback({ content_id: contentId, rating, comment });
      setStatus('done');
      setComment('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send feedback.');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-10">
        <h1 className="text-3xl font-bold text-white">Share your feedback</h1>
        <p className="text-white/70">Help us improve MagineAI by rating your magazine.</p>

        <GlassCard className="mt-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Content ID</label>
              <input
                required
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand-300 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Rating (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand-300 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Comments</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand-300 focus:outline-none"
              />
            </div>
            {error && <p className="text-sm text-red-200">{error}</p>}
            {status === 'done' && (
              <p className="text-sm text-brand-100">Thanks! Feedback recorded.</p>
            )}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="rounded-2xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-900/30 transition hover:bg-brand-400 disabled:opacity-60"
            >
              {status === 'submitting' ? 'Sending...' : 'Submit Feedback'}
            </button>
          </form>
        </GlassCard>
      </main>
    </div>
  );
}

