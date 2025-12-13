'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState('All Items');

  const libraryItems = [
    { title: 'Blue Horizons', type: 'Book', date: 'Oct 24, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUG2iR7jldtk6um4-EJXACw6vZsCXqeChnMuzuwZO8-gAhRh9e6j6IUkEXfNzQT9u4vTIDDFZVMown1EjCuREiayFwgVCDJzFzltz8gXgzczB7kzNhaqMsTlJL_k5N66Aefs1lEsCiY7z4V36cjBmjopFV3GyUYxXTs9FEBJai4z9edtpGyQkiyNAonzqMPruKdz1M8BPvPNFN2BeDp9YObhk8FGIosXUG1h2WJrBNCq9po70TaW7_bGSJTyL0M1z0g8R9vw4f31e1', color: 'blue' },
    { title: 'Forest Whispers', type: 'Story', date: 'Oct 20, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOfgytDneBRpwrzJKXTiQVtbIQc7ap4cXJLeeycR8tj_TvVgW-kvaBt4KV3oqHUR86dXY2ApbtD_x3OvBjT51zkw8sRsYYMEG99_bRTfIVpXUjHYUwo8RzDUHQAzuECo6pj-Ch5B1ISXeVPmsX_XQyQo2n1w9PjtFvcluEzp5g0Rv6Vf7TVrp25V4SNzJjeFNwGOHBWqMxcqFbi54vpKUCM9YnMPPNlmHhccN8ejUc4lAhSK6pR7cQJWT-QaJ2z2p1y1J_uXNOldOV', color: 'green' },
    { title: 'Fashion Forward 2024', type: 'Mag', date: 'Oct 18, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9_4HswBdtYKF7maWEJhmXHUW8dvpoDmbqZEUOfK3jqV-slGnq2sHakVvxq3cQOpnBY2zu1tYXJVkOcAscOKseA1cJpJlwS2O01WWyvNkfQIrRuTiduQyIgzXp3lThPjEVl6rVVZuCCluhdvm4rAx3qpR84PkIqDnAzY26QXZF_8_-6lddaGxTHy3V8vThHaReHrH_fe2_NHYUAlmW41j-nsovlvyyLOa4aubI81N0EYCzRosPPojTtpfidZeeZjxzPJ-J3Re6FbMn', color: 'pink' },
    { title: 'Culinary Arts: Fall', type: 'Mag', date: 'Sep 30, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPyU_aKuD0NMumxopxF7DuE0kPZ5PXuB24JIbfqpTN9lecLZJeOXSOqNt2yI2Yp6CTJtpgAvgSlnnfQS1MwmL6zYirmp__DONxBCfqtmDCu2UdBM4RE5JeAAeQScbeObAJ3nC3E-OaFfnwHSeIeEKHkM031vqGhiYP2rYc5LqAn2mYf7fugIR9s24nLlSrs5pcnZ78BU2AzWfkrhJ9XKIb85N03GaEmuSYjmc7T3AxGVch1nP-aS666h6vR-UCsIbBWXF7hV-mFG4a', color: 'orange' },
    { title: 'Code Mastery', type: 'Book', date: 'Sep 15, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCF5AFPr17qla3d7RItO3m4WQiIl7Yhg3FeHtvDROgsk27wU47grBX8JIzxmIQ-cWK9GR7LObhVYJBmwpRiI50kbGXZ-MhCDDvBzP8qtzjXbYzSo694RM-rj49kWp31rW7dGXrnIrmGWvpMFp2aROLgWCSMHWnzZnx1Fbjhdgi_eOe2XEvfnPFPk2Ju3ONH2IQXJuUtFCr0FIxkBgszgpuHwNDiySsaeIbUm1r5g0-jHIkam9wePV4QkhgPMc9r2nNniGZc0y-77Xyf', color: 'indigo' },
    { title: 'A Space Odyssey', type: 'Story', date: 'Aug 22, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCml6LiVRqZBuPSNi_BojVoVHR26axMzk03HqHTn0lcgawFfSzFrhMjOnw1ad1EC5BQWoyuXWV_gYptUIuZz1zQniauifNYv3HcXtpdU7jUo-KzJS5aZ8UP4dJrcoInPSIZ-6LXa5bTmFytcBbfdBOaHmu1RWdrRmMgDVCmlplAkZm2F_z_fyZ_doY8KWlYU578seZKb22UEDHH-FcxMfwx1LlSYSWg9sAvU16yeGB05N3SqzK5GVf70CiDlEHCUt555Yvb8mR3aA3I', color: 'purple' }
  ];

  const typeColors: Record<string, string> = {
    Book: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    Story: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    Mag: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-display antialiased h-screen flex overflow-hidden selection:bg-primary selection:text-white">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-full shrink-0 transition-colors duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-border-light dark:border-border-dark h-20">
          <div className="size-8 text-primary flex items-center justify-center">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-text-main-light dark:text-white">MagineAI</h2>
        </div>
        <div className="flex flex-col flex-1 p-4 gap-6 overflow-y-auto">
          {/* Stats */}
          <div className="bg-background-light dark:bg-background-dark/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-main-light dark:text-white mb-1">Library Stats</h3>
            <p className="text-xs text-text-sub-light dark:text-text-sub-dark">12 Mags, 5 Books Generated</p>
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium transition-colors" href="#">
              <span className="material-symbols-outlined filled">library_books</span>
              <span>Library</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-sub-light dark:text-text-sub-dark hover:bg-background-light dark:hover:bg-background-dark/50 hover:text-text-main-light dark:hover:text-white transition-colors" href="#">
              <span className="material-symbols-outlined">folder_open</span>
              <span>Collections</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-sub-light dark:text-text-sub-dark hover:bg-background-light dark:hover:bg-background-dark/50 hover:text-text-main-light dark:hover:text-white transition-colors" href="#">
              <span className="material-symbols-outlined">favorite</span>
              <span>Favorites</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-sub-light dark:text-text-sub-dark hover:bg-background-light dark:hover:bg-background-dark/50 hover:text-text-main-light dark:hover:text-white transition-colors" href="#">
              <span className="material-symbols-outlined">delete</span>
              <span>Trash</span>
            </a>
          </nav>
          <div className="mt-auto">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-sub-light dark:text-text-sub-dark hover:bg-background-light dark:hover:bg-background-dark/50 cursor-pointer transition-colors">
              <span className="material-symbols-outlined">settings</span>
              <span>Settings</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-6 flex items-center justify-between shrink-0 z-20">
          {/* Mobile Menu Trigger */}
          <button className="lg:hidden mr-4 text-text-main-light dark:text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark">search</span>
              </div>
              <input className="block w-full rounded-lg border-none bg-background-light dark:bg-background-dark py-2.5 pl-10 pr-4 text-sm text-text-main-light dark:text-white placeholder-text-sub-light dark:placeholder-text-sub-dark focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Search for stories, books, or magazines..." type="text" />
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-4 ml-6">
            <Link href="/create">
              <button className="hidden sm:flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md shadow-primary/20">
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Create New</span>
              </button>
            </Link>
            <div className="h-8 w-[1px] bg-border-light dark:bg-border-dark mx-2"></div>
            <ThemeToggle />
            <button className="relative p-2 text-text-sub-light dark:text-text-sub-dark hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="size-10 rounded-full bg-cover bg-center border-2 border-border-light dark:border-border-dark cursor-pointer" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBSwlJZ47ONFsePugL7NgiNspnVUymj0QLdvtin7tP3fBC9dv849mk9VRVfgFjr027y2u71CNZWV1G41gAYwYHXoclFzOjMR6vM8YHOmY9NncLr4XTgxO18UGeCyyJDlo1QtiPYzO3ZfL76rqBqeROTQP_gtnwGuqYn-EIhcfBp2YqBkNX9g-Dd2GM27DTF7Doz9cb98mHeG0QoSMPU-B-Dl9bYo6PtCKxvXvPEskVgd59C7PfPPLmKPRkP-DoK4-KHZQW9wuZDwI2D')" }}></div>
          </div>
        </header>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-8 pb-10">
            {/* Heading Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-main-light dark:text-white tracking-tight mb-2">Welcome back, Alex</h1>
                <p className="text-text-sub-light dark:text-text-sub-dark">Here's your personal library of AI-generated wonders.</p>
              </div>
            </div>
            {/* Recent Activity / Hero Card */}
            <section>
              <div className="flex flex-col md:flex-row bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-border-light dark:border-border-dark gap-6 items-center md:items-stretch group hover:border-primary/30 transition-all">
                {/* Cover Image */}
                <div className="w-full md:w-1/3 aspect-video md:aspect-auto md:h-48 rounded-xl bg-cover bg-center shadow-md relative overflow-hidden" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqIcUOltcRQ5Hw1stQmMnikfiVNtPMiLsK1UoEjQwRSyhWA5qi5lw3KwfdfZD7LyUZMNMr6pOoFOX3DjHe0sNi3K3WUS8zBNGFcWbBNlZOJJCegLowtWAR4xXXT-tdnaSJOISjVln82NlXeXrmAZ8yND2jUf_V7_QvduzdrPEfKalTHtLisMBoAEen8TmXEG7MkqlWtOJYg-EIVui6jf_Vf07YxCeYL1d5tjlsUlg2JtpaLTSKZlEzPzoLEZRVWcmdzlAzXESN709Y')" }}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all"></div>
                </div>
                {/* Content */}
                <div className="flex-1 flex flex-col justify-between py-1 w-full">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center rounded-md bg-purple-100 dark:bg-purple-900/30 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 ring-1 ring-inset ring-purple-700/10">Sci-Fi Magazine</span>
                      <span className="text-xs text-text-sub-light dark:text-text-sub-dark">Generated 2 days ago</span>
                    </div>
                    <h3 className="text-2xl font-bold text-text-main-light dark:text-white mb-2">The Martian Garden: Vol 4</h3>
                    <p className="text-text-sub-light dark:text-text-sub-dark text-sm line-clamp-2">Explore the latest breakthroughs in extraterrestrial botany and the resilient species thriving under the red sky.</p>
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-text-main-light dark:text-white">Reading Progress</span>
                      <span className="text-primary">45%</span>
                    </div>
                    <div className="w-full bg-border-light dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2 px-6 rounded-lg transition-colors">Continue Reading</button>
                      <button className="bg-transparent border border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-white/5 text-text-main-light dark:text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">Details</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* Filters & Toolbar */}
            <div className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm py-2 -mx-2 px-2 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center bg-surface-light dark:bg-surface-dark p-1 rounded-lg border border-border-light dark:border-border-dark shadow-sm w-full sm:w-auto overflow-x-auto">
                {['All Items', 'Magazines', 'Books', 'Stories'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap ${
                      activeFilter === filter
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-sub-light dark:text-text-sub-dark hover:text-text-main-light dark:hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span className="text-sm text-text-sub-light dark:text-text-sub-dark hidden md:block">Sort by:</span>
                <div className="relative">
                  <select className="appearance-none bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-main-light dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-8 cursor-pointer">
                    <option>Date Created</option>
                    <option>Title (A-Z)</option>
                    <option>Last Opened</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-sub-light dark:text-text-sub-dark">
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </div>
                </div>
                <button className="p-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-text-sub-light dark:text-text-sub-dark hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
              </div>
            </div>
            {/* Grid Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {libraryItems.map((item, idx) => (
                <div key={idx} className="group relative flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url('${item.img}')` }}></div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 bg-white/90 dark:bg-black/80 rounded-full hover:bg-white text-gray-700 dark:text-gray-200">
                        <span className="material-symbols-outlined text-[20px]">favorite</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-text-main-light dark:text-white leading-tight line-clamp-1" title={item.title}>{item.title}</h3>
                      <button className="text-text-sub-light dark:text-text-sub-dark hover:text-primary">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-sub-light dark:text-text-sub-dark mt-auto">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${typeColors[item.type]}`}>{item.type}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* FAB for Mobile */}
        <Link href="/create">
          <button className="sm:hidden fixed bottom-6 right-6 size-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>
        </Link>
      </main>
    </div>
  );
}

