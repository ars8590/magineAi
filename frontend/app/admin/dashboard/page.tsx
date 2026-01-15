'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { fetchContent, moderateContent, fetchUsers, updateUserStatus, fetchAllAdminContent, deleteAdminContent } from '../../../lib/api';
import type { GeneratedContent } from '../../../types';

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  status: 'active' | 'blocked';
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // Views: 'overview', 'users', 'content'
  const [view, setView] = useState('overview');

  const [users, setUsers] = useState<User[]>([]);
  const [contentList, setContentList] = useState<(GeneratedContent & { users: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(false);

  // Content Review State
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
      loadDashboardData();
    }
  }, [router]);

  const loadDashboardData = async () => {
    // Potentially load stats
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAdminContent();
      setContentList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    if (!confirm(`Are you sure you want to ${newStatus} this user?`)) return;
    try {
      await updateUserStatus(userId, newStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Delete this content permanently?')) return;
    try {
      await deleteAdminContent(id);
      setContentList(contentList.filter(c => c.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  useEffect(() => {
    if (view === 'users') loadUsers();
    if (view === 'content' || view === 'overview') loadAllContent(); // Overview uses content for queue
  }, [view]);

  // Old specific content loader
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

  const moderate = async (action: 'approve' | 'reject', targetId?: string) => {
    const id = targetId || contentId;
    if (!token || !id) return;
    setStatus('moderating');
    setMessage(null);
    try {
      await moderateContent(token, { contentId: id, action });
      setMessage(`Content ${action}d`);
      // Update lists
      if (view === 'content' || view === 'overview') {
        setContentList(prev => prev.map(c => c.id === id ? { ...c, status: action === 'approve' ? 'approved' : 'rejected' } : c));
      }
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
          <button onClick={() => setView('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group w-full text-left ${view === 'overview' ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white' : 'text-text-sec-light dark:text-text-sec-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary dark:hover:text-white'}`}>
            <span className="material-symbols-outlined filled" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="text-sm font-semibold">Overview</span>
          </button>
          <button onClick={() => setView('users')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group w-full text-left ${view === 'users' ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white' : 'text-text-sec-light dark:text-text-sec-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary dark:hover:text-white'}`}>
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-medium">User Management</span>
          </button>
          <button onClick={() => setView('content')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group w-full text-left justify-between ${view === 'content' ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white' : 'text-text-sec-light dark:text-text-sec-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary dark:hover:text-white'}`}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">shield</span>
              <span className="text-sm font-medium">Content Moderation</span>
            </div>
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{contentList.filter(c => c.status === 'pending').length}</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-sec-light dark:text-text-sec-dark hover:bg-red-500/10 hover:text-red-600 transition-all group w-full text-left mt-auto">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
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
            {view === 'users' ? (
              <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden p-6">
                <h3 className="text-lg font-bold mb-4">User Management</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border-light dark:border-border-dark">
                        <th className="pb-3 text-sm font-bold opacity-70">User</th>
                        <th className="pb-3 text-sm font-bold opacity-70">Email</th>
                        <th className="pb-3 text-sm font-bold opacity-70">Joined</th>
                        <th className="pb-3 text-sm font-bold opacity-70">Status</th>
                        <th className="pb-3 text-sm font-bold opacity-70 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-border-light dark:border-border-dark last:border-0 hover:bg-background-light dark:hover:bg-background-dark/50">
                          <td className="py-4 text-sm font-medium">{u.name}</td>
                          <td className="py-4 text-sm">{u.email}</td>
                          <td className="py-4 text-sm opacity-70">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleBlockUser(u.id, u.status)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${u.status === 'active' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                            >
                              {u.status === 'active' ? 'Block' : 'Unblock'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : view === 'content' ? (
              <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden p-6">
                <h3 className="text-lg font-bold mb-4">Content Moderation</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-background-light dark:bg-background-dark text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
                      {contentList.map(c => (
                        <tr key={c.id} className="group hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                          <td className="px-6 py-4 font-medium">{c.title}</td>
                          <td className="px-6 py-4 text-sm opacity-80">{c.users?.name || 'Unknown'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${c.status === 'approved' ? 'bg-green-100 text-green-800' : c.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button onClick={() => moderate('approve', c.id)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50" title="Approve">
                              <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            </button>
                            <button onClick={() => moderate('reject', c.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50" title="Reject">
                              <span className="material-symbols-outlined text-[20px]">cancel</span>
                            </button>
                            <button onClick={() => handleDeleteContent(c.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-100" title="Delete">
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Overview Mode (Existing Layout, simplified for queue)
              <div className="flex flex-col gap-8">
                {/* Stats ... (Use existing cards if you want, omitting for brevity in this chunk if they are static) */}
                {/* Content Moderation Queue (Using dynamic data) */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">Pending Review</h3>
                      <p className="text-sm text-text-sec-light dark:text-text-sec-dark">{contentList.filter(c => c.status === 'pending').length} items needing attention</p>
                    </div>
                    <button onClick={() => setView('content')} className="text-primary font-bold text-sm">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
                        {contentList.filter(c => c.status === 'pending').slice(0, 5).map(c => (
                          <tr key={c.id} className="group hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                            <td className="px-6 py-4 font-bold">{c.title}</td>
                            <td className="px-6 py-4">{c.users?.name}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => moderate('approve', c.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><span className="material-symbols-outlined">check_circle</span></button>
                                <button onClick={() => moderate('reject', c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined">cancel</span></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
