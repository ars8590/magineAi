'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { fetchContent } from '../../../lib/api';
import { MagazineLayout } from '../../../components/MagazineLayout';
import { Loader } from '../../../components/Loader';
import { MagazinePageRenderer } from '../../../components/MagazinePageRenderer';
import { exportMultiPageToPdf, exportContentToPdf } from '../../../utils/pdf';
import type { GeneratedContent, MagazineStructure, MagazinePage } from '../../../types';

export default function PreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New State for Pagination
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

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

  // Derived state to check if content is structured
  const magazineStructure: MagazineStructure | null = useMemo(() => {
    if (!data?.mainStory) return null;
    try {
      const parsed = JSON.parse(data.mainStory);
      if (parsed && parsed.pages && Array.isArray(parsed.pages)) {
        return parsed as MagazineStructure;
      }
    } catch (e) { }
    return null;
  }, [data]);

  const currentPage: MagazinePage | null = magazineStructure ? magazineStructure.pages[currentPageIndex] : null;

  const handleDownload = async () => {
    if (!data) return;
    setPdfGenerating(true);
    try {
      if (magazineStructure) {
        // Use Screenshot-based Export for structured content
        const pageIds = magazineStructure.pages.map((_, i) => `print-page-${i}`);
        await exportMultiPageToPdf(pageIds, `magineai-${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);
      } else {
        // Fallback to legacy
        await exportContentToPdf(data, `magineai-${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);
      }
    } catch (err: any) {
      console.error(err);
      setError('PDF export failed. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const nextPage = () => {
    if (magazineStructure && currentPageIndex < magazineStructure.pages.length - 1) {
      setCurrentPageIndex(p => p + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(p => p - 1);
      window.scrollTo(0, 0);
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
            {/* Logo Icon */}
            <svg className="h-full w-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-text-main-light dark:text-white text-xl font-extrabold leading-tight tracking-[-0.015em]">MagineAI</h2>
        </div>
        <div className="flex flex-1 justify-end gap-4 lg:gap-8 items-center">
          <button
            onClick={handleDownload}
            disabled={pdfGenerating}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pdfGenerating ? (
              <>
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex grow flex-col w-full max-w-[1200px] mx-auto px-4 lg:px-8 py-6 pb-20">

        {/* Render Legacy Layout if not structured */}
        {!magazineStructure && data && (
          <div id="magazine-preview">
            <MagazineLayout content={data} />
            {data.images && data.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {data.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                    <img src={img} alt={`Page ${idx}`} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Render NEW Structured Layout */}
        {magazineStructure && currentPage && (
          <div className="flex flex-col gap-8">
            {/* Pagination Controls Top */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <button
                onClick={prevPage}
                disabled={currentPageIndex === 0}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Previous Page
              </button>
              <div className="text-center">
                <span className="block text-sm font-bold text-gray-500 uppercase tracking-widest">Page {currentPage.pageNumber} of {magazineStructure.totalPages}</span>
                <span className="text-lg font-bold text-primary">{currentPage.type.replace('_', ' ')}</span>
              </div>
              <button
                onClick={nextPage}
                disabled={currentPageIndex === magazineStructure.pages.length - 1}
                className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50 hover:bg-primary/90 transition shadow-lg shadow-primary/20"
              >
                Next Page
              </button>
            </div>

            {/* Current Page View */}
            <MagazinePageRenderer page={currentPage} structure={magazineStructure} renderMode="screen" />

          </div>
        )}

        {/* HIDDEN PRINT CONTAINER: Renders ALL pages for PDF export */}
        {magazineStructure && (
          <div className="fixed left-[200vw] top-0 pointer-events-none opacity-0">
            {magazineStructure.pages.map((p, i) => (
              <div id={`print-page-${i}`} key={i} className="mb-8">
                <MagazinePageRenderer page={p} structure={magazineStructure} renderMode="print" />
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

