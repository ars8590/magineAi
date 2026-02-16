'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchContent, submitFeedback } from '../../../lib/api';
import { GeneratedContent, MagazineStructure } from '../../../types';
import { MagazinePageRenderer } from '../../../components/MagazinePageRenderer';
import { Loader } from '../../../components/Loader';

export default function ReaderPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [content, setContent] = useState<GeneratedContent | null>(null);
    const [structure, setStructure] = useState<MagazineStructure | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const load = async () => {
            try {
                const data = await fetchContent(id);
                setContent(data);

                // Parse the main story JSON
                try {
                    const parsedStructure = JSON.parse(data.mainStory || '{}');
                    // Ensure pages exist
                    if (!parsedStructure.pages) {
                        // Fallback for legacy or empty content
                        parsedStructure.pages = [];
                    }
                    setStructure(parsedStructure);
                } catch (e) {
                    console.error("Failed to parse magazine structure", e);
                    // Minimal fallback structure
                    setStructure({ title: data.title, totalPages: 0, pages: [] });
                }
            } catch (err: any) {
                console.error("Failed to fetch content", err);
                setError(err.response?.status === 403
                    ? "You don't have permission to view this content."
                    : "Content not found or could not be loaded.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-text-main-light dark:text-white">
                <Loader />
                <p className="mt-4 text-sm text-text-sub-light dark:text-text-sub-dark">Loading your magazine...</p>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-text-main-light dark:text-white p-6 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">sentiment_dissatisfied</span>
                <h1 className="text-2xl font-bold mb-2">Oops!</h1>
                <p className="text-text-sub-light dark:text-text-sub-dark mb-8">{error || "Something went wrong."}</p>
                <Link href="/dashboard">
                    <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold transition-all">
                        Return to Dashboard
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#0f1117] font-display overflow-x-hidden">
            {/* Navigation Bar */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#1c192e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-main-light dark:text-white">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-text-main-light dark:text-white line-clamp-1">{content.title}</h1>
                        <p className="text-xs text-text-sub-light dark:text-text-sub-dark">MagineAI Reader</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Placeholder for future actions like Print/Share */}
                </div>
            </div>

            {/* Scrollable Content Area */}
            <main className="max-w-5xl mx-auto py-12 px-4 md:px-8 space-y-16">

                {/* Introduction Section */}
                {content.introduction && (
                    <section className="bg-white dark:bg-[#1c192e] rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="text-2xl font-bold mb-6 text-text-main-light dark:text-white">Editorial Introduction</h2>
                        <div className="prose dark:prose-invert max-w-none text-lg text-text-sub-light dark:text-gray-300 leading-relaxed font-serif">
                            {content.introduction}
                        </div>
                    </section>
                )}

                {/* Magazine Pages */}
                {structure && structure.pages && structure.pages.length > 0 ? (
                    <div className="flex flex-col gap-12">
                        {structure.pages.map((page, index) => (
                            <div key={index} className="shadow-2xl">
                                <MagazinePageRenderer
                                    page={page}
                                    structure={structure}
                                    renderMode="screen"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    // Legacy Content Fallback
                    <section className="bg-white dark:bg-[#1c192e] rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="prose dark:prose-invert max-w-none text-lg text-text-sub-light dark:text-gray-300 leading-relaxed">
                            {content.content || "No content details available."}
                        </div>
                    </section>
                )}

                {/* Conclusion Section */}
                {content.conclusion && (
                    <section className="bg-white dark:bg-[#1c192e] rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800 border-l-4 border-l-primary">
                        <h2 className="text-xl font-bold mb-4 text-text-main-light dark:text-white">Final Thoughts</h2>
                        <div className="prose dark:prose-invert max-w-none text-lg text-text-sub-light dark:text-gray-300 leading-relaxed italic">
                            {content.conclusion}
                        </div>
                    </section>
                )}

                {/* Feedback Section */}
                <section className="bg-white dark:bg-[#1c192e] rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold mb-6 text-text-main-light dark:text-white">Rate this Magazine</h2>
                    <FeedbackForm contentId={content.id} />
                </section>
            </main>
        </div>
    );
}

function FeedbackForm({ contentId }: { contentId: string }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return alert("Please select a star rating.");
        setSubmitting(true);
        try {
            await submitFeedback({ content_id: contentId, rating, comment });
            setSubmitted(true);
        } catch (err) {
            alert("Failed to submit feedback. You may have already reviewed this.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-green-500 mb-2">check_circle</span>
                <p className="text-lg font-bold text-text-main-light dark:text-white">Thank you for your feedback!</p>
                <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Your review helps us improve.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 max-w-md">
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-3xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400 filled' : 'text-gray-300 dark:text-gray-600'}`}
                    >
                        <span className={`material-symbols-outlined ${rating >= star ? 'filled' : ''}`}>star</span>
                    </button>
                ))}
                <span className="ml-2 text-sm text-text-sub-light dark:text-text-sub-dark">{rating > 0 ? `${rating} Stars` : 'Select rating'}</span>
            </div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your thoughts (optional)..."
                className="w-full bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg p-4 focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px] text-text-main-light dark:text-white"
            />
            <button
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </div>
    );
}
