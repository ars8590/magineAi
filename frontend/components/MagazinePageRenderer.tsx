import React from 'react';
import { MagazinePage, MagazineStructure } from '../types';

interface MagazinePageRendererProps {
    page: MagazinePage;
    structure: MagazineStructure;
    renderMode?: 'screen' | 'print';
}

export function MagazinePageRenderer({ page, structure, renderMode = 'screen' }: MagazinePageRendererProps) {
    const isPrint = renderMode === 'print';
    const layout = page.layout || 'simple-text';

    // Common footer component
    const Footer = () => (
        <div className="absolute bottom-8 left-0 right-0 flex justify-between px-12 text-[10px] tracking-widest uppercase text-gray-400 font-sans border-t border-gray-100 dark:border-gray-800 pt-4 mx-12">
            <span>MagineAI • {structure.title}</span>
            <span>Page {page.pageNumber}</span>
        </div>
    );

    return (
        <div className={`
      relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col
      ${isPrint ? 'w-[1200px] h-[1600px]' : 'rounded-2xl shadow-2xl min-h-[800px] aspect-[3/4]'} 
    `}>
            {/* Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] z-0"></div>

            {page.type === 'COVER' ? (
                <div className="relative h-full flex flex-col z-10">
                    <div className="absolute inset-0">
                        {page.image && <img src={page.image} alt="Cover" className="w-full h-full object-cover" crossOrigin="anonymous" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                    </div>
                    <div className="relative z-20 flex flex-col justify-between h-full p-12 text-center text-white">
                        <div className="w-full flex justify-between border-b border-white/20 pb-4 uppercase tracking-[0.4em] text-xs font-bold">
                            <span>MagineAI</span>
                            <span>Special Edition</span>
                        </div>
                        <div className="mt-auto mb-20 space-y-6">
                            <h1 className="text-7xl lg:text-9xl font-black leading-none tracking-tighter drop-shadow-2xl">{structure.title}</h1>
                            <p className="text-2xl font-serif italic text-white/90 max-w-2xl mx-auto leading-relaxed">{page.content}</p>
                        </div>
                    </div>
                </div>
            ) : page.type === 'CONTENTS' ? (
                <div className="relative h-full p-12 lg:p-20 z-10 flex flex-col">
                    <h2 className="text-5xl font-black mb-16 text-gray-900 dark:text-white uppercase tracking-tighter">Contents</h2>
                    <div className="flex-1 space-y-8">
                        {(() => {
                            try {
                                const items = JSON.parse(page.content || '[]');
                                return items.map((item: any, i: number) => (
                                    <div key={i} className="flex items-baseline group cursor-pointer hover:text-primary transition dark:text-gray-200">
                                        <span className="text-2xl font-bold font-serif w-12 text-gray-300 group-hover:text-primary transition-colors">{(item.page < 10 ? '0' : '') + item.page}</span>
                                        <div className="flex-1 border-b border-gray-200 dark:border-gray-700 mx-4 relative top-[-6px]"></div>
                                        <span className="text-xl font-medium tracking-tight uppercase">{item.title}</span>
                                    </div>
                                ));
                            } catch (e) { return <p>Contents loading...</p> }
                        })()}
                    </div>
                    <Footer />
                </div>
            ) : page.type === 'BACK_COVER' ? (
                <div className="flex flex-col items-center justify-center h-full bg-gray-950 text-white p-12 text-center z-10 relative">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/noise.png')]"></div>
                    <h3 className="text-4xl font-bold mb-2 tracking-widest uppercase">MagineAI</h3>
                    <p className="text-gray-500 text-sm tracking-[0.2em] mb-12">Imagination Engineered</p>
                    <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                    </div>
                </div>
            ) : page.type === 'INTRODUCTION' ? (
                /* INTRODUCTION PAGE - Enforce Top/Side Image (No Overlap) */
                <div className="flex-1 flex flex-col p-12 lg:p-16 z-10">
                    <header className="mb-10">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{page.type.replace('_', ' ')}</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-none">{page.title}</h2>
                    </header>
                    <div className="flex-1 grid gap-8 lg:grid-cols-2">
                        {page.image && (
                            <div className="relative rounded-lg overflow-hidden h-64 lg:h-auto shadow-lg lg:order-last">
                                <img src={page.image} alt={page.title} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <p className="text-white text-xs italic opacity-80">{page.imagePrompt || 'Visual interpretation'}</p>
                                </div>
                            </div>
                        )}
                        <div className="prose dark:prose-invert max-w-none font-serif text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                            {page.content}
                        </div>
                    </div>
                    <Footer />
                </div>
            ) : (
                /* STANDARD PAGES (Chapters, Intro, etc) */
                <div className="relative h-full flex flex-col z-10">

                    {/* FULL IMAGE LAYOUT */}
                    {layout === 'full-image' ? (
                        <div className="relative h-full">
                            <div className="absolute inset-0">
                                {page.image && <img src={page.image} alt={page.title} className="w-full h-full object-cover" crossOrigin="anonymous" />}
                                <div className="absolute inset-0 bg-black/40"></div>
                            </div>
                            <div className="relative h-full p-16 flex flex-col justify-end text-white">
                                {page.chapterNumber && <span className="text-sm font-bold tracking-[0.3em] uppercase mb-4 text-primary">Chapter {page.chapterNumber}</span>}
                                <h2 className="text-6xl font-black mb-8 leading-tight">{page.title}</h2>
                                <div className="prose prose-invert prose-lg max-w-2xl font-serif text-white/90 drop-shadow-md">
                                    {page.content}
                                </div>
                            </div>
                            <Footer />
                            {/* Note: Footer might need white text override for full-image, but default is gray. Let's make it white here. */}
                            <div className="absolute bottom-8 left-0 right-0 flex justify-between px-12 text-[10px] tracking-widest uppercase text-white/60 font-sans border-t border-white/20 pt-4 mx-12">
                                <span>MagineAI • {structure.title}</span>
                                <span>Page {page.pageNumber}</span>
                            </div>
                        </div>
                    ) : layout === 'quote-break' ? (
                        /* QUOTE BREAK LAYOUT */
                        <div className="flex-1 flex flex-col items-center justify-center p-16 text-center bg-primary/5">
                            <span className="text-6xl text-primary/20 font-serif mb-8">“</span>
                            <blockquote className="text-4xl font-serif italic text-gray-800 dark:text-gray-100 leading-normal max-w-3xl">
                                {page.content}
                            </blockquote>
                            <div className="mt-8 w-12 h-1 bg-primary rounded-full"></div>
                            <h2 className="mt-6 text-sm font-bold tracking-widest uppercase text-gray-500">{page.title}</h2>
                            <Footer />
                        </div>
                    ) : (
                        /* STANDARD & IMAGE-SIDE LAYOUTS */
                        <div className="flex-1 flex flex-col p-12 lg:p-16">
                            {/* Page Header */}
                            <header className="mb-10">
                                <div className="flex items-center gap-4 mb-4">
                                    {page.chapterNumber && <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded-sm uppercase tracking-wider">CH {page.chapterNumber}</span>}
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{page.type.replace('_', ' ')}</span>
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-none">{page.title}</h2>
                            </header>

                            {/* Body */}
                            <div className={`flex-1 grid gap-8 ${layout === 'image-left' || layout === 'image-right' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>

                                {/* Image Block */}
                                {(layout === 'image-left' || layout === 'image-right' || layout === 'image-top' || layout === 'image-bottom') && page.image && (
                                    <div className={`
                          relative rounded-lg overflow-hidden h-fit shadow-lg
                          ${layout === 'image-left' ? 'lg:order-first' : ''}
                          ${layout === 'image-right' ? 'lg:order-last' : ''}
                          ${layout === 'image-top' ? 'order-first h-64 w-full mb-8' : ''}
                          ${layout === 'image-bottom' ? 'order-last mt-auto h-64 w-full' : ''}
                       `}>
                                        <img src={page.image} alt={page.title} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                            <p className="text-white text-xs italic opacity-80">{page.imagePrompt || 'Visual interpretation'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Text Block */}
                                <div className={`prose dark:prose-invert max-w-none font-serif text-lg leading-relaxed text-gray-700 dark:text-gray-300 ${layout === 'simple-text' ? 'columns-1 lg:columns-2 gap-12' : ''}`}>
                                    {page.content}
                                </div>
                            </div>

                            <Footer />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
