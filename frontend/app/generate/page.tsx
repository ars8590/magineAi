'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Loader } from '../../components/Loader';
import { Navbar } from '../../components/Navbar';
import { generateContent } from '../../lib/api';
import type { GenerationRequest } from '../../types';

export default function GeneratePage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const payload: GenerationRequest | null = useMemo(() => {
    const age = params.get('age');
    const genre = params.get('genre');
    const theme = params.get('theme');
    const keywords = params.get('keywords');
    const language = params.get('language');
    const pages = params.get('pages');
    if (!age || !genre || !theme || !keywords || !language) return null;
    return {
      age: Number(age),
      genre,
      theme,
      keywords,
      language,
      pages: pages ? Number(pages) : undefined
    };
  }, [params]);

  useEffect(() => {
    if (!payload) {
      setError('Missing generation parameters. Please start again.');
      return;
    }
    const run = async () => {
      try {
        const { id } = await generateContent(payload);
        router.replace(`/preview/${id}`);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Generation failed. Please retry.');
      }
    };
    run();
  }, [payload, router]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="glass w-full max-w-xl space-y-4 rounded-3xl border border-white/10 bg-white/5 p-10">
          {!error ? (
            <>
              <Loader />
              <p className="text-sm text-white/70">
                We are prompting Gemini for the story, Imagen for artwork, applying safety filters,
                then building your magazine layout.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-red-200">Something went wrong</p>
              <p className="text-sm text-white/70">{error}</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-brand-900/40 transition hover:bg-brand-400"
              >
                Start Over
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

