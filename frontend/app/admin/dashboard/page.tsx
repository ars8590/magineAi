'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { fetchContent, moderateContent } from '../../../lib/api';
import type { GeneratedContent } from '../../../types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [contentId, setContentId] = useState('');
  const [reviewed, setReviewed] = useState<GeneratedContent | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'moderating'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin_token');
    if (!stored) {
      router.replace('/admin/login');
    } else {
      setToken(stored);
    }
  }, [router]);

  const loadContent = async () => {
    if (!contentId) return;
    setStatus('loading');
    setMessage(null);
    try {
      const data = await fetchContent(contentId);
      setReviewed(data);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Unable to load content.');
    } finally {
      setStatus('idle');
    }
  };

  const moderate = async (action: 'approve' | 'reject') => {
    if (!token || !contentId) return;
    setStatus('moderating');
    setMessage(null);
    try {
      await moderateContent(token, { contentId, action });
      setMessage(`Content ${action}d`);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Moderation failed.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-display antialiased h-screen flex overflow-hidden selection:bg-primary selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex flex-col z-20 transition-colors duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>auto_stories</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight">MagineAI</h1>
            <p className="text-text-sec-light dark:text-text-sec-dark text-xs font-medium">Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-white group transition-all" href="#">
            <span className="material-symbols-outlined filled" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="text-sm font-semibold">Overview</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-sec-light dark:text-text-sec-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary dark:hover:text-white transition-all group" href="#">
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-medium">User Management</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-sec-light dark:text-text-sec-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary dark:hover:text-white transition-all group justify-between" href="#">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">shield</span>
              <span className="text-sm font-medium">Content Moderation</span>
            </div>
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">14</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-sec-light dark:text-text-sec-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary dark:hover:text-white transition-all group" href="#">
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="text-sm font-medium">Analytics</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-sec-light dark:text-text-sec-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary dark:hover:text-white transition-all group" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
        </nav>
        <div className="p-4 border-t border-border-light dark:border-border-dark">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="relative">
              <div className="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-surface-dark shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBOH8309y-jeoj3NEggtVu0YHiaBNeCm9tpWhVOV8dQeh8q_DnS8G24tc5VPyUPVsS0vjX3EglcKNbVhEz93-J3eaf0-l13wcb3in5mya1EAWscND4o0MVd4qB01dTaTjvoUtJUTGlJyzg4oHjBItd3I9rGtQoNAQPQV_ysNHA1w_fDJ2-pm1CX5uiGjgGb4FNw1zTuvw62vNijoPL8cu6cC12tj83epg6PrVGJ9mykJm4LFG4Gc9GrF3lR3ngAymo5iJhiEjhnEqgQ')" }}></div>
              <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-bold">Admin User</p>
              <p className="text-xs text-text-sec-light dark:text-text-sec-dark">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-background-light dark:bg-background-dark">
        {/* Top Navigation Bar */}
        <header className="h-20 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">Dashboard Overview</h2>
          </div>
          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="relative w-80 hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-sec-light dark:text-text-sec-dark text-xl">search</span>
              <input className="w-full h-10 pl-10 pr-4 bg-background-light dark:bg-background-dark border-none rounded-lg text-sm focus:ring-2 focus:ring-primary text-text-main-light dark:text-text-main-dark placeholder:text-text-sec-light dark:placeholder:text-text-sec-dark" placeholder="Search users, magazines, or logs..." type="text" />
            </div>
            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button className="relative size-10 flex items-center justify-center rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-text-sec-light dark:text-text-sec-dark transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>
              </button>
              <button className="size-10 flex items-center justify-center rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-text-sec-light dark:text-text-sec-dark transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
          </div>
        </header>
        {/* Scrollable Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Stats / KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-4 group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <span className="flex items-center text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-full">+12.5%</span>
                </div>
                <div>
                  <p className="text-text-sec-light dark:text-text-sec-dark text-sm font-medium">Active Users</p>
                  <h3 className="text-3xl font-bold mt-1">24,592</h3>
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-4 group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                    <span className="material-symbols-outlined">library_books</span>
                  </div>
                  <span className="flex items-center text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-full">+5.2%</span>
                </div>
                <div>
                  <p className="text-text-sec-light dark:text-text-sec-dark text-sm font-medium">Total Magazines</p>
                  <h3 className="text-3xl font-bold mt-1">1.2M</h3>
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-4 group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
                    <span className="material-symbols-outlined">hourglass_top</span>
                  </div>
                  <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-500/10 px-2 py-1 rounded-full">Action Req.</span>
                </div>
                <div>
                  <p className="text-text-sec-light dark:text-text-sec-dark text-sm font-medium">Pending Review</p>
                  <h3 className="text-3xl font-bold mt-1">14</h3>
                </div>
              </div>
              {/* Card 4 */}
              <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-4 group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                    <span className="material-symbols-outlined">dns</span>
                  </div>
                  <span className="flex items-center text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-full">Healthy</span>
                </div>
                <div>
                  <p className="text-text-sec-light dark:text-text-sec-dark text-sm font-medium">Server Load</p>
                  <h3 className="text-3xl font-bold mt-1">42%</h3>
                </div>
              </div>
            </div>

            {/* Charts & System Health Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold">Generations per Day</h3>
                    <p className="text-sm text-text-sec-light dark:text-text-sec-dark">Content creation trends over the last 30 days</p>
                  </div>
                  <div className="flex gap-2">
                    <select className="bg-background-light dark:bg-background-dark border-none text-sm rounded-lg py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-primary font-medium cursor-pointer">
                      <option>Last 30 Days</option>
                      <option>Last 7 Days</option>
                      <option>Last 24 Hours</option>
                    </select>
                  </div>
                </div>
                {/* SVG Chart Implementation */}
                <div className="w-full h-[250px] relative">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 472 150">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4b2bee" stopOpacity="0.2"></stop>
                        <stop offset="100%" stopColor="#4b2bee" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V150H0V109Z" fill="url(#chartGradient)"></path>
                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" fill="none" stroke="#4b2bee" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                  </svg>
                  {/* X Axis Labels */}
                  <div className="flex justify-between mt-4 text-xs font-semibold text-text-sec-light dark:text-text-sec-dark px-2">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>
              </div>
              {/* System Health / Recent Activity Side Panel */}
              <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">System Status</h3>
                  <span className="flex size-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background-light dark:bg-background-dark">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-text-sec-light text-sm">database</span>
                      <span className="text-sm font-medium">Database Latency</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">24ms</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background-light dark:bg-background-dark">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-text-sec-light text-sm">api</span>
                      <span className="text-sm font-medium">API Response</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">110ms</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background-light dark:bg-background-dark">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-text-sec-light text-sm">memory</span>
                      <span className="text-sm font-medium">GPU Cluster</span>
                    </div>
                    <span className="text-sm font-bold text-primary">85% Usage</span>
                  </div>
                </div>
                <div className="h-px bg-border-light dark:bg-border-dark w-full"></div>
                <div>
                  <h4 className="text-sm font-bold mb-3 text-text-sec-light dark:text-text-sec-dark uppercase tracking-wider">Recent Activity</h4>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="mt-1 size-2 rounded-full bg-primary shrink-0"></div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm text-text-main-light dark:text-text-main-dark">New subscription: <b>Enterprise Plan</b></p>
                        <p className="text-xs text-text-sec-light dark:text-text-sec-dark">2 mins ago</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-1 size-2 rounded-full bg-orange-400 shrink-0"></div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm text-text-main-light dark:text-text-main-dark">Content flagged: <b>Magazine #9921</b></p>
                        <p className="text-xs text-text-sec-light dark:text-text-sec-dark">15 mins ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Moderation Queue */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border-light dark:border-border-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">Content Moderation Queue</h3>
                  <p className="text-sm text-text-sec-light dark:text-text-sec-dark">Items flagged by AI for manual review</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                    Filter
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shadow-lg shadow-primary/25">
                    Review Batch
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-background-light dark:bg-background-dark text-text-sec-light dark:text-text-sec-dark text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Content</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Flag Reason</th>
                      <th className="px-6 py-4">AI Score</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
                    <tr className="group hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-lg bg-cover bg-center shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD30F5--ZhHQ_QH3XCRl5X6aUnn4VenxLUiVL13zpDjD8y1bgXr7Js7KLdKK1aVq1mylS3rBdlt2UEDn2kyXs0LtV6OCV4QAniYJCTsRxYxIwDHOo5Av9mkONgdD5G62mbuwFjQYggQbmFWNcLxKSLVuxe0W9wgNGsCLcrg2akP5xrTH0jsofjs-Xpou4x-jeJowAN99u5u-dVrrARyaevAuE1-hdcQxt1K-k9R8dX9gHDb6c-JQYk11T8DFkhHLdXLEwrx0F1Zb_1s')" }}></div>
                          <div>
                            <p className="font-bold text-text-main-light dark:text-text-main-dark">Future Cities Vol. 4</p>
                            <p className="text-xs text-text-sec-light dark:text-text-sec-dark">Generated 1hr ago</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDILMriL1pgLPLSf0P4vZO5P73F8S72V6_QcPtkLe2iTKbQscUvEanEmA5IV3Ao6oCB0_4GURDuu97_dhj0r8SookHJD4dBlZglG4L-HnMloyi6KN15ZUIwoEUnjMPLuhbOCoaQnInszhzJYPSea1AOJu46h8rsWq2n1sq-fL03yTN07e0p2sYDwY68L9f2Ng7ZKZnCjyeEh9XnqdfA6zwAk25RGDzAfDanQc2HISZRoZdpsxzzWoelpnj7PaGyzftXbWdMlI2USNKO')" }}></div>
                          <span className="font-medium">Sarah Jenkins</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Copyright Potential
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 w-[65%]"></div>
                          </div>
                          <span className="text-xs font-bold">65% Safe</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Approve">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          </button>
                          <button className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Reject">
                            <span className="material-symbols-outlined text-[20px]">cancel</span>
                          </button>
                          <button className="p-1.5 rounded-lg text-text-sec-light hover:bg-background-light dark:hover:bg-slate-700 transition-colors" title="More Info">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="group hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-lg bg-cover bg-center shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBIL31jsKpHgCHq5A_C8ssJdGcq9YumNUv1OiuMuY-HDnBZNON-0a5K9Z0Jl-GcUxoKDjkr35e2Kz0wZL91_7TeD210_3bWm_cbDG0rJI51fHOkEl5vhkLHL1iucXIiVOmnjeaMDjGPDCELVly5muKC4lM0w-E5gsFIJJjR3vRQcW47vqJguICknAnl6j-TtmhR-i1pKamEPkKY1FQgukdCgK3nk5WqGom_g6ic9KWef2ZBIPug8FzXndpdc07wqyp2vjx0pSgdY89r')" }}></div>
                          <div>
                            <p className="font-bold text-text-main-light dark:text-text-main-dark">Abstract Arts</p>
                            <p className="text-xs text-text-sec-light dark:text-text-sec-dark">Generated 2hrs ago</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">MK</div>
                          <span className="font-medium">Mike Kowalski</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          Sensitive Topic
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 w-[82%]"></div>
                          </div>
                          <span className="text-xs font-bold">82% Safe</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Approve">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          </button>
                          <button className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Reject">
                            <span className="material-symbols-outlined text-[20px]">cancel</span>
                          </button>
                          <button className="p-1.5 rounded-lg text-text-sec-light hover:bg-background-light dark:hover:bg-slate-700 transition-colors" title="More Info">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-border-light dark:border-border-dark flex justify-center">
                <button className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">View All Pending Items</button>
              </div>
            </div>

            {/* Legacy Moderation Section */}
            {reviewed && (
              <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                <h3 className="text-lg font-bold mb-4">Content Review</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Content ID</label>
                    <input
                      type="text"
                      value={contentId}
                      onChange={(e) => setContentId(e.target.value)}
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 py-2 text-sm"
                      placeholder="Enter content ID"
                    />
                  </div>
                  <button
                    onClick={loadContent}
                    disabled={status === 'loading'}
                    className="w-full rounded-lg bg-primary text-white px-4 py-2 font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Loading...' : 'Load Content'}
                  </button>
                  {reviewed && (
                    <div className="space-y-2">
                      <p className="font-semibold">{reviewed.title}</p>
                      <p className="text-sm text-text-sec-light">{reviewed.introduction}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moderate('approve')}
                          disabled={status === 'moderating'}
                          className="flex-1 rounded-lg bg-green-500 text-white px-4 py-2 font-medium hover:bg-green-600 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => moderate('reject')}
                          disabled={status === 'moderating'}
                          className="flex-1 rounded-lg bg-red-500 text-white px-4 py-2 font-medium hover:bg-red-600 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                  {message && <p className="text-sm text-text-sec-light">{message}</p>}
                </div>
              </div>
            )}

            {/* Footer (Simple) */}
            <footer className="mt-4 text-center pb-6">
              <p className="text-xs text-text-sec-light dark:text-text-sec-dark">© 2023 MagineAI Inc. Dashboard v2.4.1</p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
