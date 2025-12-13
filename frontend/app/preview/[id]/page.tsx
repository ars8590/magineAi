'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { fetchContent } from '../../../lib/api';
import { MagazineLayout } from '../../../components/MagazineLayout';
import { Loader } from '../../../components/Loader';
import { exportContentToPdf, exportElementToPdf } from '../../../utils/pdf';
import type { GeneratedContent } from '../../../types';

export default function PreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchContent(params.id);
        setData(response);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Could not load magazine.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const handleDownload = async () => {
    if (!data) {
      setError('Content not loaded yet. Please wait.');
      return;
    }

    setPdfGenerating(true);
    setError(null);
    
    try {
      // If content has non-ASCII characters, fallback to DOM capture to retain script support
      const textBlob = `${data.title} ${data.introduction} ${data.mainStory} ${data.characterHighlights} ${data.conclusion}`;
      const hasNonAscii = /[^\u0000-\u007f]/.test(textBlob);

      if (hasNonAscii) {
        await exportElementToPdf('magazine-preview', `magineai-${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);
      } else {
        // Use direct PDF generation with content data
        await exportContentToPdf(
          data,
          `magineai-${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to export PDF right now.');
      console.error('PDF generation error:', err);
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <Loader label="Loading your content..." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/create" className="text-primary hover:underline">Go back to create</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main-light dark:text-gray-100 font-display min-h-screen flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light dark:border-gray-800 bg-background-light dark:bg-background-dark/95 backdrop-blur-sm px-6 lg:px-10 py-3">
        <div className="flex items-center gap-4">
          <div className="size-8 text-primary">
            <svg className="h-full w-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-text-main-light dark:text-white text-xl font-extrabold leading-tight tracking-[-0.015em]">MagineAI</h2>
        </div>
        <div className="flex flex-1 justify-end gap-4 lg:gap-8 items-center">
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-text-main-light dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium leading-normal">Home</Link>
            <Link href="/create" className="text-text-main-light dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium leading-normal">Generate</Link>
            <a className="text-text-main-light dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium leading-normal" href="#">My Library</a>
          </nav>
          <ThemeToggle />
          <button className="flex items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-[#e9e7f3] dark:bg-gray-800 text-text-main-light dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-white dark:border-gray-700 shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBllRWM4_MZUrkGZbhmve83Qju5_INOOy6SdjawXpBzbFZ8lGWJ81s9wxaYfFc2tlnIfvIT_-R-3Z2qiSYIHAVZXGSaAVTjM2JjbzaSY4J89Xn7i4F8Kjbz_nN00LJ5dLIa7XhB1HhzcdKuA7x4Dm5mj6dp5V70FKH3bb8lpf2BEN9z0-_GKLPDVm0LbXoSH4_Z3mOyN4q6SIauvSoIaiWYTWacRy5OPs1ecq8IZAETCjtOWObLEKYfO5MNyly4N3lkoxV_sSXEF7dI')" }}></div>
        </div>
      </header>

      <main className="flex grow flex-col w-full max-w-[1200px] mx-auto px-4 lg:px-8 py-6 pb-20">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 py-2 mb-4 text-sm">
          <Link href="/" className="text-primary hover:text-primary/80 font-medium">Home</Link>
          <span className="text-gray-400 font-medium material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href="/create" className="text-primary hover:text-primary/80 font-medium">Generate</Link>
          <span className="text-gray-400 font-medium material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-text-main-light dark:text-white font-medium opacity-60">{data?.title || 'Loading...'}</span>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Hero Section */}
            <div className="@container mb-12">
              <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
                {/* Book Cover */}
                <div className="w-full lg:w-[400px] flex-shrink-0 flex justify-center lg:justify-start perspective-[1000px]">
                  <div className="relative w-[280px] sm:w-[320px] aspect-[2/3] rounded-r-xl rounded-l-sm book-shadow transform transition-transform duration-500 hover:scale-[1.02] bg-gray-200 dark:bg-gray-800 overflow-hidden group" style={{ boxShadow: '-15px 0 30px -10px rgba(0,0,0,0.2), 0 25px 50px -12px rgba(0,0,0,0.35)' }}>
                    {/* Spine hint */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/20 to-transparent z-20 pointer-events-none"></div>
                    {data.images && data.images.length > 0 ? (
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${data.images[0]}')` }}></div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-400/20"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h3 className="font-display font-bold text-2xl leading-tight mb-1">{data.title}</h3>
                      <p className="text-sm opacity-80 font-light tracking-wider">MAGINEAI</p>
                    </div>
                  </div>
                </div>
                {/* Content Info */}
                <div className="flex flex-col flex-1 pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Sci-Fi</span>
                    <span className="bg-orange-500/10 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Young Adult</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium ml-auto lg:ml-0">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      Generated just now
                    </div>
                  </div>
                  <h1 className="text-text-main-light dark:text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-[-0.033em] mb-4">
                    {data.title}
                  </h1>
                  <h2 className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mb-8">
                    Generated for you • Reading time: ~1.5 hours. <br className="hidden sm:block"/>
                    {data.introduction?.substring(0, 100)}...
                  </h2>
                  {/* Primary Actions */}
                  <div className="flex flex-wrap gap-4 mb-8">
                    <button
                      onClick={() => {
                        const element = document.getElementById('magazine-preview');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary hover:bg-primary/90 text-white text-base font-bold shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
                    >
                      <span className="material-symbols-outlined text-[20px]">menu_book</span>
                      Start Reading
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={pdfGenerating}
                      className="flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-text-main-light dark:text-white text-base font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">download</span>
                      {pdfGenerating ? 'Generating...' : 'Download PDF'}
                    </button>
                  </div>
                  {/* Secondary Actions Bar */}
                  <div className="flex flex-wrap gap-2 sm:gap-6 border-t border-gray-100 dark:border-gray-800 pt-6">
                    <button className="group flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors w-20">
                      <div className="rounded-full bg-[#e9e7f3] dark:bg-gray-700 p-2.5 text-text-main-light dark:text-white group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">share</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Share</span>
                    </button>
                    <button className="group flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors w-20">
                      <div className="rounded-full bg-[#e9e7f3] dark:bg-gray-700 p-2.5 text-text-main-light dark:text-white group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Edit Text</span>
                    </button>
                    <button className="group flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors w-20">
                      <div className="rounded-full bg-[#e9e7f3] dark:bg-gray-700 p-2.5 text-text-main-light dark:text-white group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">New Cover</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">
              {/* Left Column: Synopsis & Art */}
              <div className="lg:col-span-8 flex flex-col gap-10">
                {/* Synopsis Card */}
                <div className="bg-white dark:bg-gray-800/40 rounded-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-800">
                  <h3 className="text-2xl font-bold text-text-main-light dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    Story Synopsis
                  </h3>
                  <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p className="mb-4">{data.introduction}</p>
                    <p>{data.mainStory?.substring(0, 500)}...</p>
                  </div>
                </div>
                {/* Illustrations Gallery */}
                {data.images && data.images.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-text-main-light dark:text-white">Inside this Edition</h3>
                      <a className="text-primary text-sm font-bold hover:underline" href="#">View all {data.images.length} images</a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.images.slice(0, 2).map((img, idx) => (
                        <div key={idx} className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in">
                          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${img}')` }}></div>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">Chapter {idx + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Magazine Preview */}
                <div id="magazine-preview" className="mt-8">
                  <MagazineLayout content={data} />
                </div>
              </div>
              {/* Right Column: Metadata & Recommendations */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Metadata Box */}
                <div className="bg-white dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Story Details</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Reading Level</span>
                      <span className="text-text-main-light dark:text-white font-semibold text-sm">Grade 9-12</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Word Count</span>
                      <span className="text-text-main-light dark:text-white font-semibold text-sm">
                        {data.mainStory?.split(' ').length || 0} words
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Format</span>
                      <span className="text-text-main-light dark:text-white font-semibold text-sm">Illustrated Novella</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Illustrations</span>
                      <span className="text-text-main-light dark:text-white font-semibold text-sm">{data.images?.length || 0} Generated</span>
                    </div>
                  </div>
                </div>
                {/* More like this */}
                <div className="bg-[#f2f0f9] dark:bg-gray-800/20 rounded-xl p-6">
                  <h4 className="text-base font-bold text-text-main-light dark:text-white mb-4">You might also like</h4>
                  <div className="flex flex-col gap-4">
                    <a className="flex gap-3 group" href="#">
                      <div className="w-16 h-20 rounded bg-gray-300 bg-cover bg-center shrink-0 shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEO401bJHPrEuxVuV9-otRvDlejmZGTQjMPH1qvNO--OGuG0ZfhThWTyzZAIp_5Uwdj3aQXayf-RCJulMfO8vMkwIhHsDmDblSghauMpFd7AAHNHHIRuwUWy-KI0h7UtLriKCa0UtoV5YBfLgn9Y8iABdPk5vg-f0KzXOPUkpyWE6YI7x3OwXSd2igxH4rwrVMt9QVtHSR353xcUFnmYew7m9qjUExF2eKv_grCcs8e3_WfPqDLtYKZocs8sceIQ8cZpAjLjcNRt_H')" }}></div>
                      <div className="flex flex-col justify-center">
                        <h5 className="font-bold text-sm text-text-main-light dark:text-white group-hover:text-primary transition-colors leading-tight mb-1">The Silicon Ocean</h5>
                        <p className="text-xs text-gray-500">Cyberpunk • 30 Pages</p>
                      </div>
                    </a>
                    <a className="flex gap-3 group" href="#">
                      <div className="w-16 h-20 rounded bg-gray-300 bg-cover bg-center shrink-0 shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCKPY2U7YnZDCHo9YdY3YwV40MzcVeBz2viTaTj-2-8PF4bIPVW6WFeN1Rp9CWKChbKhU5aIx7O1WZ6sO6dVNbDBUT_1ojUmWTedZOSv3GL65mMHhGnC4OaqQ2bPWYL19iYpISFzQVm9q8eStPrXTmzdyz3WLcpLbh5X-ryKrRmXoDH1o1HiyxiiTPoNrthHpN-NNRsUafOER2YuMksGmw_9SFkzoZ9jvFUjGugBgIHrTfkQsMjzB9y0fd8nYzV_v8vosA4i9CsA8Ky')" }}></div>
                      <div className="flex flex-col justify-center">
                        <h5 className="font-bold text-sm text-text-main-light dark:text-white group-hover:text-primary transition-colors leading-tight mb-1">Starlight Express</h5>
                        <p className="text-xs text-gray-500">Space Opera • 55 Pages</p>
                      </div>
                    </a>
                  </div>
                  <Link href="/create">
                    <button className="w-full mt-5 py-2.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10 transition-colors">
                      Generate Similar Story
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
