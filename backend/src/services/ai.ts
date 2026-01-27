import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerationRequest, MagazinePage, MagazineStructure } from '../types';
import { config } from '../config';

const unsafePatterns = [/violence/i, /hate/i, /nudity/i, /explicit/i];

// Initialize Gemini AI client
let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI) {
    if (!config.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return genAI;
}

function planMagazine(input: GenerationRequest): MagazinePage[] {
  const minPages = 5;
  const requestedPages = input.pages || 25;
  const totalPages = Math.max(requestedPages, minPages);
  const pages: MagazinePage[] = [];

  let currentPage = 1;

  // 1. Cover (Always Page 1)
  pages.push({ pageNumber: currentPage++, type: 'COVER', title: `${input.theme} Magazine` });

  // 2. Front Matter (Editor's Note, TOC, Intro)
  // For small magazines (< 8 pages), skip some front matter
  if (totalPages >= 8) {
    pages.push({ pageNumber: currentPage++, type: 'EDITOR_NOTE', title: "Editor's Note" });
    pages.push({ pageNumber: currentPage++, type: 'CONTENTS', title: "Table of Contents" });
  }
  pages.push({ pageNumber: currentPage++, type: 'INTRODUCTION', title: "Introduction" });

  // 3. Back Matter (Summary, Back Cover) - Reserve 2 pages at the end
  const reservedForEnd = 2; // Summary + Back Cover
  const lastPage = totalPages;
  const contentEndPage = lastPage - reservedForEnd;

  // 4. Chapters
  // Fill the space from current page to contentEndPage
  let chapterIndex = 1;
  while (currentPage <= contentEndPage) {
    pages.push({
      pageNumber: currentPage++,
      type: 'CHAPTER',
      chapterNumber: chapterIndex++,
      title: `Chapter ${chapterIndex}` // Placeholder
    });
  }

  // 5. Summary
  pages.push({ pageNumber: currentPage++, type: 'SUMMARY', title: "Summary & Highlights" });

  // 6. Back Cover
  pages.push({ pageNumber: currentPage++, type: 'BACK_COVER' });

  // In matching specific requested counts, if we overshot (possible if totalPages was small and we forced front matter?),
  // but logic above: starts at 1. Cover. 2. Intro (if total<8). Current=3.
  // contentEndPage = 5 - 2 = 3.
  // while (3 <= 3) -> push Chapter 1. Current=4.
  // push Summary. Current=5.
  // push Back Cover. Current=6.
  // Wait, Cover(1), Intro(2), Ch(3), Sum(4), Back(5). 
  // Length is 5. Correct.

  return pages;
}

export async function generateStory(input: GenerationRequest): Promise<any> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

  // 1. Plan the magazine structure (Allocating slots)
  const pages = planMagazine(input);
  const magazine: MagazineStructure = {
    title: `${input.theme} Magazine`,
    totalPages: pages.length,
    pages: pages
  };

  console.log(`Planning magazine with ${pages.length} pages.`);

  // 2. NEW: Generate Content in a STRUCTURED way (Sections vs Pages)
  // We calculate available chapter slots to guide length, but don't force page-by-page.
  const chapterSlots = pages.filter(p => p.type === 'CHAPTER');
  const approxWords = chapterSlots.length * 500; // Target total length

  const contentPrompt = `You are the Editor-in-Chief. Write the FULL text content for a magazine about "${input.theme}" in ${input.language || 'English'}.
    
    Audience: ${input.age} years old. Genre: ${input.genre}. Keywords: ${input.keywords}.
    
    Structure Requirements:
    - Cover: Catchy tagline.
    - Editor's Note: Welcoming, 2-3 paragraphs.
    - Introduction: Deep dive, MAX 245 WORDS. Must fit on one page. Do NOT split.
    - Chapters: Generate ${Math.max(2, Math.ceil(chapterSlots.length / 1.5))} distinct chapters.
      * CRITICAL: Write each chapter as ONE CONTINUOUS BLOCK of text. 
      * Do NOT split chapters into pages yourself. 
      * Each chapter should be long and detailed (no upper limit).
      * Do NOT summarize. Fill the content.
    - Summary: Detailed takeaways.
    
    RETURN ONLY A VALID JSON OBJECT with this exact structure:
    {
      "cover": { "title": "...", "tagline": "...", "image_prompt": "..." },
      "editors_note": { "title": "...", "content": "..." },
      "introduction": { "title": "...", "content": "...", "image_prompt": "..." },
      "chapters": [
        { "title": "...", "content": "FULL CONTINUOUS TEXT...", "image_prompt": "..." },
        ...
      ],
      "summary": { "title": "...", "content": "..." }
    }
    
    Layout Notes: 'image_prompt' must be English visual descriptions.
    IMPORTANT: Write full narrative arcs. Do not end mid-sentence.`;

  try {
    console.log("Generating full magazine content...");
    const result = await model.generateContent(contentPrompt);
    const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const genData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    // 3. Assign Content to Slots (The Reflow Logic)

    // --- Front Matter ---
    const coverPage = magazine.pages.find(p => p.type === 'COVER');
    if (coverPage && genData.cover) {
      coverPage.title = genData.cover.title || coverPage.title;
      coverPage.content = genData.cover.tagline || genData.cover.content;
      coverPage.imagePrompt = genData.cover.image_prompt;
      coverPage.layout = 'full-image';
    }

    const editorPage = magazine.pages.find(p => p.type === 'EDITOR_NOTE');
    if (editorPage && genData.editors_note) {
      editorPage.title = genData.editors_note.title || "Editor's Note";
      editorPage.content = genData.editors_note.content;
      editorPage.layout = 'simple-text';
    }

    const introPage = magazine.pages.find(p => p.type === 'INTRODUCTION');
    if (introPage && genData.introduction) {
      introPage.title = genData.introduction.title || "Introduction";
      introPage.content = genData.introduction.content;
      introPage.imagePrompt = genData.introduction.image_prompt;
      introPage.layout = 'image-top'; // Enforce the safe layout we fixed earlier
    }

    // --- CHAPTERS (Reflow) ---
    // Helper to split text into chunks of ~245 words (approx 1 page) respecting paragraphs
    const splitIntoPages = (text: string, wordsPerPage = 245): string[] => {
      const paragraphs = text.split('\n');
      const pages: string[] = [];
      let currentPage = "";
      let currentWords = 0;

      for (const para of paragraphs) {
        if (!para.trim()) continue;
        const paraWords = para.split(/\s+/).length;

        if (currentWords + paraWords > wordsPerPage && currentWords > 100) {
          // Push current page
          pages.push(currentPage.trim());
          currentPage = para + "\n\n";
          currentWords = paraWords;
        } else {
          currentPage += para + "\n\n";
          currentWords += paraWords;
        }
      }
      if (currentPage.trim()) pages.push(currentPage.trim());
      return pages;
    };

    const generatedChapters = genData.chapters || [];
    let currentSlotIndex = 0;

    for (let i = 0; i < generatedChapters.length; i++) {
      const chapter = generatedChapters[i];
      // Split this chapter into chunks of 245 words (Strict Page Limit)
      const chunks = splitIntoPages(chapter.content, 245);

      for (let c = 0; c < chunks.length; c++) {
        if (currentSlotIndex >= chapterSlots.length) break; // No more pages allocated

        const slot = chapterSlots[currentSlotIndex];
        slot.title = c === 0 ? chapter.title : `${chapter.title} (Cont.)`;
        slot.content = chunks[c];
        slot.imagePrompt = c === 0 ? chapter.image_prompt : undefined; // Only image for first page of chapter
        slot.layout = c === 0 ? (i % 2 === 0 ? 'image-right' : 'image-left') : 'simple-text'; // Text-only for continuation
        slot.chapterNumber = i + 1; // Correct logical chapter number

        currentSlotIndex++;
      }
    }

    // Handle unused slots (if generation was shorter than planned pages)
    while (currentSlotIndex < chapterSlots.length) {
      const slot = chapterSlots[currentSlotIndex];
      slot.type = 'FEATURE'; // Convert unused chapter to feature or ad placeholder logic?
      // Actually, let's just fill it with a generic "Notes" or cut it? 
      // We can't cut pages easily from the array middle without shifting numbers. 
      // Let's make it a "Gallery" page if we have prompt? 
      // Or just leave it blank? 
      // Let's use a filler.
      slot.title = "Visual Gallery";
      slot.layout = 'full-image';
      slot.content = "";
      // Seed image will handle the rest
      currentSlotIndex++;
    }


    // --- Back Matter ---
    const summaryPage = magazine.pages.find(p => p.type === 'SUMMARY');
    if (summaryPage && genData.summary) {
      summaryPage.title = genData.summary.title || "Summary";
      summaryPage.content = genData.summary.content;
      summaryPage.layout = 'simple-text';
    }

    // TOC Generation (Post-Reflow)
    const tocPage = magazine.pages.find(p => p.type === 'CONTENTS');
    if (tocPage) {
      // Collect logical chapters (unique titles)
      const logicalChapters = chapterSlots
        .filter((p, i, arr) => !p.title?.includes('(Cont.)'))
        .map(p => ({ page: p.pageNumber, title: p.title }));
      tocPage.content = JSON.stringify(logicalChapters);
    }

    // Final Image Seeding
    for (const page of magazine.pages) {
      if (page.type === 'BACK_COVER' || page.type === 'CONTENTS') continue;

      // Generate seed if no image yet
      if (!page.image) {
        const seedSource = page.imagePrompt || page.title || input.theme + page.pageNumber;
        const seed = seedSource.replace(/[^a-z0-9]/gi, '-');
        page.image = `https://picsum.photos/seed/${seed}/800/1200`;
      }
    }


  } catch (error) {
    console.error("Failed to generate content:", error);
    // Fallback logic remains roughly same, or simplify
    magazine.pages.forEach(p => {
      if (!p.content) { p.content = "Generation failed. Please retry."; }
      if (!p.image) { p.image = `https://picsum.photos/seed/${p.pageNumber}/800/1200`; }
    });
  }

  // Return formatted response
  const intro = magazine.pages.find(p => p.type === 'INTRODUCTION');
  const sum = magazine.pages.find(p => p.type === 'SUMMARY');

  return {
    title: magazine.title,
    introduction: intro?.content || "",
    main_story: JSON.stringify(magazine),
    character_highlights: sum?.content || "",
    conclusion: "End",
    images: magazine.pages.map(p => p.image || "")
  };
}

// Kept for signature compatibility but effectively unused if main flow changes
export async function generateImages(input: GenerationRequest) {
  // This is now handled inside generateStory to align images with pages
  return [];
}

export function isUnsafe(text: string) {
  return unsafePatterns.some((pattern) => pattern.test(text));
}

export async function moderateOutput(sections: Record<string, string>, retries = 2) {
  // Simplified moderation for the new structure
  const unsafe = Object.values(sections).some((s) => isUnsafe(s || ''));
  if (unsafe) throw new Error('Content rejected. Please revise your inputs.');
  return sections;
}
