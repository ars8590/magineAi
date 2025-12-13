'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Navbar } from '../../../components/Navbar';
import { GlassCard } from '../../../components/GlassCard';
import { adminLogin } from '../../../lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await adminLogin(username, password);
      localStorage.setItem('admin_token', token);
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-md px-6 pb-16 pt-14">
        <GlassCard className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Admin Login</h1>
            <p className="text-sm text-white/70">Secure access to moderation dashboard.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand-300 focus:outline-none"
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand-300 focus:outline-none"
            />
            {error && <p className="text-sm text-red-200">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-brand-900/40 transition hover:bg-brand-400 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </GlassCard>
      </main>
    </div>
  );
}

