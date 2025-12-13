'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '../../components/ThemeToggle';
import type { GenerationRequest } from '../../types';

const initial: GenerationRequest = {
  age: 13,
  genre: 'Sci-Fi',
  theme: 'Space Exploration',
  keywords: 'Time Travel, Friendship',
  language: 'English',
  pages: 20
};

const genres = [
  { id: 'Sci-Fi', icon: 'rocket_launch', label: 'Sci-Fi' },
  { id: 'Fantasy', icon: 'castle', label: 'Fantasy' },
  { id: 'Mystery', icon: 'search', label: 'Mystery' },
  { id: 'Romance', icon: 'favorite', label: 'Romance' },
  { id: 'Historical', icon: 'history_edu', label: 'Historical' },
  { id: 'Comedy', icon: 'theater_comedy', label: 'Comedy' }
];

const themes = [
  'Space Exploration',
  'Victorian London',
  'Medieval Fantasy',
  'Cyberpunk Future',
  'Underwater Adventure',
  'Time Travel',
  'Magic School',
  'Post-Apocalyptic',
  'Steampunk',
  'Ancient Egypt',
  'Fairy Tale Kingdom',
  'Space Station',
  'Tropical Island',
  'Arctic Expedition',
  'Wild West',
  'Samurai Era',
  'Pirate Adventure',
  'Superhero City',
  'Alien Planet',
  'Haunted Mansion'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'bn', name: 'Bengali' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'mr', name: 'Marathi' },
  { code: 'pa', name: 'Punjabi' }
];

const pageOptions = [10, 15, 20, 25, 30, 35, 40, 50, 60, 75, 100];

export default function CreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<GenerationRequest>(initial);
  const [keywords, setKeywords] = useState<string[]>(['Time Travel', 'Friendship']);
  const [keywordInput, setKeywordInput] = useState('');

  const update = (key: keyof GenerationRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: key === 'age' ? Number(value) : value }));
  };

  const addKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
      update('keywords', [...keywords, keywordInput.trim()].join(', '));
    }
  };

  const removeKeyword = (idx: number) => {
    const newKeywords = keywords.filter((_, i) => i !== idx);
    setKeywords(newKeywords);
    update('keywords', newKeywords.join(', '));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      age: String(form.age),
      genre: form.genre,
      theme: form.theme,
      keywords: form.keywords,
      language: form.language,
      pages: String(form.pages || 20)
    });
    router.push(`/generate?${params.toString()}`);
  };

  const agePercentage = ((form.age - 3) / (120 - 3)) * 100;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main-light dark:text-gray-100 antialiased overflow-x-hidden min-h-screen">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#f9f8fc] dark:bg-background-dark border-b border-solid border-border-light dark:border-gray-800">
        <div className="px-4 md:px-10 py-3 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4 text-text-main-light dark:text-white">
            <div className="size-8 text-primary">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">MagineAI</h2>
          </div>
          {/* Desktop Nav */}
          <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">My Library</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Community</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/create">
                <button className="flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-colors">
                  <span className="truncate">Create New</span>
                </button>
              </Link>
              <div className="bg-center bg-no-repeat bg-cover rounded-full size-9 ring-2 ring-gray-100 dark:ring-gray-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB4RgcX6FoD_uoP_GQ6gPxDVXl5hc6LaAD9h03VzfFcLS_QpNIjRrRRnBXTL4yc8LWMTY7RFqxXtMnhYD_fllSJFJraKa3aAp3YadbobMans5EolLVo84tnEnW5o6M9JPV-q-tv1hC6jm-J63Q7Y2K2yC2sfLlPv4fNJwjKsuRWOsivLHZNECNJl4CyBxkDyQkzYp_i4SkIaRty04iZ_IslIOtX-DlnacxuX6NP3z0fjm13oxyPbGloSnzeKVJhFN6Uu0DkorVVKiVK')" }}></div>
            </div>
          </div>
          {/* Mobile Menu Icon */}
          <div className="md:hidden text-text-main-light dark:text-white">
            <span className="material-symbols-outlined">menu</span>
          </div>
        </div>
      </header>

      <main className="flex flex-col min-h-[calc(100vh-65px)]">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8">
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
            {/* LEFT COLUMN: Input Form */}
            <div className="flex-1 flex flex-col gap-8">
              {/* Page Heading */}
              <div className="flex flex-col gap-3">
                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-text-main-light dark:text-white">
                  Let's craft your <span className="text-primary">perfect story</span>
                </h1>
                <p className="text-text-sub-light dark:text-gray-400 text-lg font-normal leading-normal max-w-2xl">
                  Tell us a bit about what you want to read, and our AI will weave the magic specifically for you.
                </p>
              </div>

              {/* Section 1: Age Group */}
              <section className="bg-white dark:bg-[#1c192e] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">face</span>
                  Who is this story for?
                </h3>
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Age Group</label>
                    <span className="text-2xl font-bold text-primary">
                      {form.age < 13 ? 'Kids' : form.age < 18 ? 'Teens (13-17)' : 'Adults'}
                    </span>
                  </div>
                  {/* Custom Range Slider Representation */}
                  <div className="relative w-full h-12 flex items-center select-none">
                    <div className="absolute w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${agePercentage}%` }}></div>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="120"
                      value={form.age}
                      onChange={(e) => update('age', Number(e.target.value))}
                      className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                      style={{
                        background: 'transparent'
                      }}
                    />
                    <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-4 border-primary rounded-full shadow cursor-grab hover:scale-110 transition-transform" style={{ left: `${agePercentage}%` }}></div>
                    {/* Markers */}
                    <div className="absolute top-6 w-full flex justify-between text-xs font-medium text-gray-400 mt-2">
                      <span>Kids</span>
                      <span>Teens</span>
                      <span>Adults</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Genre Selection */}
              <section className="bg-white dark:bg-[#1c192e] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">explore</span>
                  Pick a world to explore
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {genres.map((genre) => (
                    <div
                      key={genre.id}
                      onClick={() => update('genre', genre.id)}
                      className={`relative group cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center gap-3 transition-all ${
                        form.genre === genre.id
                          ? 'border-primary bg-primary/5 dark:bg-primary/10'
                          : 'border-transparent hover:border-primary/30 bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      {form.genre === genre.id && (
                        <div className="absolute top-2 right-2 text-primary">
                          <span className="material-symbols-outlined text-xl">check_circle</span>
                        </div>
                      )}
                      <div className={`size-12 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center transition-colors ${
                        form.genre === genre.id ? 'text-primary' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary'
                      }`}>
                        <span className="material-symbols-outlined text-2xl">{genre.icon}</span>
                      </div>
                      <span className={`font-medium text-sm ${
                        form.genre === genre.id ? 'font-bold' : 'text-gray-600 dark:text-gray-300'
                      }`}>{genre.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 3: Fine Tuning */}
              <section className="bg-white dark:bg-[#1c192e] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">tune</span>
                  Add the details
                </h3>
                <div className="flex flex-col gap-6">
                  {/* Theme Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Main Theme</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 z-10">lightbulb</span>
                      <select
                        value={form.theme}
                        onChange={(e) => update('theme', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-text-main-light dark:text-white appearance-none cursor-pointer"
                      >
                        {themes.map((theme) => (
                          <option key={theme} value={theme}>
                            {theme}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  {/* Keywords Tags */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Keywords & Elements</label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[100px] flex flex-wrap content-start gap-2">
                      {keywords.map((keyword, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 shadow-sm">
                          <span className="text-xs font-medium">{keyword}</span>
                          <button
                            type="button"
                            onClick={() => removeKeyword(idx)}
                            className="flex items-center justify-center text-gray-400 hover:text-red-500"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={addKeyword}
                        className="bg-transparent border-none text-sm focus:ring-0 p-0 h-7 min-w-[120px] text-text-main-light dark:text-white placeholder-gray-400"
                        placeholder="Type and press Enter..."
                      />
                    </div>
                    <p className="text-xs text-gray-500">Try keywords like 'Dragons', 'Mars Colony', or 'Summer Vacation'</p>
                  </div>
                  {/* Language Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 z-10">language</span>
                      <select
                        value={form.language}
                        onChange={(e) => update('language', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-text-main-light dark:text-white appearance-none cursor-pointer"
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.name}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  {/* Number of Pages */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Number of Pages</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 z-10">menu_book</span>
                      <select
                        value={form.pages || 20}
                        onChange={(e) => update('pages', Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-text-main-light dark:text-white appearance-none cursor-pointer"
                      >
                        {pageOptions.map((pages) => (
                          <option key={pages} value={pages}>
                            {pages} pages
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Sidebar Summary */}
            <div className="w-full lg:w-[360px] flex-shrink-0">
              <div className="sticky top-24 flex flex-col gap-4">
                {/* Summary Card */}
                <div className="bg-white dark:bg-[#1c192e] rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 text-text-main-light dark:text-white">
                    <span className="material-symbols-outlined text-primary">assignment</span>
                    <h3 className="font-bold text-lg">Your Blueprint</h3>
                  </div>
                  <div className="flex-1 flex flex-col gap-4 mb-6">
                    {/* Summary Items */}
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 size-2 rounded-full bg-primary flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Audience</p>
                        <p className="text-sm font-semibold text-text-main-light dark:text-white">
                          {form.age < 13 ? 'Kids' : form.age < 18 ? 'Teens (13-17)' : 'Adults'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 size-2 rounded-full bg-primary flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Genre</p>
                        <p className="text-sm font-semibold text-text-main-light dark:text-white">{form.genre}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 size-2 rounded-full bg-primary flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Theme</p>
                        <p className="text-sm font-semibold text-text-main-light dark:text-white">{form.theme || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 size-2 rounded-full bg-primary flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keywords</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {keywords.map((keyword, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-300">{keyword}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 size-2 rounded-full bg-primary flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Language</p>
                        <p className="text-sm font-semibold text-text-main-light dark:text-white">{form.language}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 size-2 rounded-full bg-primary flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pages</p>
                        <p className="text-sm font-semibold text-text-main-light dark:text-white">{form.pages || 20} pages</p>
                      </div>
                    </div>
                  </div>
                  {/* Live Estimate / Note */}
                  <div className="bg-primary/5 rounded-lg p-3 mb-6 flex gap-3 items-center">
                    <span className="material-symbols-outlined text-primary text-xl">timer</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Estimated generation time: <span className="text-primary font-bold">~2 minutes</span></p>
                  </div>
                  <form onSubmit={onSubmit}>
                    <button
                      type="submit"
                      className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
                    >
                      <span className="material-symbols-outlined group-hover:animate-pulse">auto_awesome</span>
                      Generate Magic
                    </button>
                  </form>
                  <p className="text-center text-xs text-gray-400 mt-3">You will be able to preview before saving.</p>
                </div>
                {/* Helper Banner */}
                <div className="bg-gradient-to-r from-[#4b2bee] to-[#6d51f3] rounded-xl p-5 text-white relative overflow-hidden hidden lg:block">
                  {/* Abstract shape decoration */}
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                  <div className="absolute -left-6 -top-6 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
                  <div className="relative z-10">
                    <p className="font-bold text-sm mb-1">Need inspiration?</p>
                    <p className="text-xs text-white/90 mb-3">Check out what others are creating in the Community Library.</p>
                    <a className="inline-flex items-center text-xs font-bold underline decoration-white/50 hover:decoration-white" href="#">
                      Explore Library <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
