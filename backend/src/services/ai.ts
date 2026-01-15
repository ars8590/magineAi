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

  // 1. Plan the magazine
  const pages = planMagazine(input);
  const magazine: MagazineStructure = {
    title: `${input.theme} Magazine`,
    totalPages: pages.length,
    pages: pages
  };

  console.log(`Planning magazine with ${pages.length} pages.`);

  // 2. Generate Titles (Small request)
  const outlinePrompt = `Plan a ${pages.filter(p => p.type === 'CHAPTER').length}-chapter magazine about "${input.theme}" (` +
    `Language: ${input.language || 'English'}, Genre: ${input.genre}, Keywords: ${input.keywords}, Age: ${input.age}). ` +
    `Return ONLY a JSON array of specific chapter titles in ${input.language || 'English'}, e.g. ["Title 1", "Title 2"].`;

  let chapterTitles: string[] = [];
  try {
    const result = await model.generateContent(outlinePrompt);
    const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) chapterTitles = JSON.parse(jsonMatch[0]);
  } catch (e) {
    // Warning surpressed for smoother UX
  }

  // Assign titles
  let chapterIndex = 0;
  for (const page of magazine.pages) {
    if (page.type === 'CHAPTER') {
      if (chapterTitles[chapterIndex]) {
        page.title = chapterTitles[chapterIndex];
      }
      chapterIndex++;
    }
  }
  magazine.title = chapterTitles[0] ? chapterTitles[0] : magazine.title;


  // 3. Generate Text for ALL pages in ONE go to respect rate limits (5 RPM)
  const contentPrompt = `You are the Editor-in-Chief. Write the full text content for a ${pages.length}-page magazine about "${input.theme}" in ${input.language || 'English'}.
    
    Structure:
    ${pages.map(p => `- Page ${p.pageNumber} (${p.type})`).join('\n')}

    Audience: ${input.age} years old. Genre: ${input.genre}. Keywords: ${input.keywords}. Language: ${input.language || 'English'}.
    
    Requirements:
    - Write ALL content in ${input.language || 'English'}.
    - Cover: Catchy tagline.
    - Editor's Note: Welcoming, ~100 words. (If present)
    - TOC: (Skip).
    - Introduction: Engaging, ~300 words.
    - Chapters: ~500 words each. Educational & Fun.
    - Summary: Key takeaways.
    - Back Cover: (Skip).

    RETURN ONLY A VALID JSON OBJECT mapping page numbers to an object containing 'title', 'content', 'layout', and 'image_prompt', like this:
    {
      "1": { 
        "title": "Localized Title", 
        "content": "Tagline here",
        "layout": "full-image",
        "image_prompt": "A futuristic city skyline at sunset, cyberpunk style"
      },
      "2": { 
        "title": "Editor's Note (Language)", 
        "content": "Editor note text...",
        "layout": "simple-text",
        "image_prompt": "Portrait of a friendly editor writing at a desk" 
      },
      ...
    }
    
    Layout Options (Choose wisely for variety):
    - 'simple-text': Valid for Editor's Note, Summary.
    - 'image-right': Standard chapter layout.
    - 'image-left': Varied chapter layout.
    - 'image-top': Good for introductions.
    - 'full-image': Use for Cover and highly visual chapters.
    - 'quote-break': Short chapters with impactful quotes.

    The 'title' field MUST match the section type but translated to the target language.
    'image_prompt' MUST be a visual description in English for an image generator (no text in image).
    Do NOT include markdown formatting or ANY other text. Just raw JSON.`;

  try {
    console.log("Generating full magazine content in one batch...");
    const result = await model.generateContent(contentPrompt);
    const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const generatedContent = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    // Assign content to pages
    for (const page of magazine.pages) {
      if (page.type === 'CONTENTS') {
        page.content = JSON.stringify(magazine.pages.filter(p => p.type === 'CHAPTER').map(p => ({ page: p.pageNumber, title: p.title })));
      } else if (page.type === 'BACK_COVER') {
        // No text
      } else {
        // Use generated content or fallback
        const pageKey = page.pageNumber.toString();
        const genPage = generatedContent[pageKey];
        if (typeof genPage === 'object' && genPage.content) {
          page.content = genPage.content;
          if (genPage.title) page.title = genPage.title;
          if (genPage.layout) page.layout = genPage.layout;
          if (genPage.image_prompt) page.imagePrompt = genPage.image_prompt;
        } else if (typeof genPage === 'string') {
          page.content = genPage;
          page.layout = 'simple-text';
        } else {
          page.content = "Content generation failed.";
          page.layout = 'simple-text';
        }
      }

      // Generate Image URL (Local/Seed based - no API call)
      // Use imagePrompt if available for better semantic binding
      if (page.type === 'COVER' || page.type === 'CHAPTER' || page.type === 'INTRODUCTION' || (page.imagePrompt && page.layout !== 'simple-text')) {
        const seedSource = page.imagePrompt || page.title || input.theme + page.pageNumber;
        const seed = seedSource.replace(/[^a-z0-9]/gi, '-');
        page.image = `https://picsum.photos/seed/${seed}/800/1200`;
      }
    }

  } catch (error) {
    console.error("Failed to generate batch content", error);
    // Fallback for demo
    magazine.pages.forEach(p => {
      if (!p.content && p.type !== 'BACK_COVER' && p.type !== 'CONTENTS') {
        p.content = "Content temporarily unavailable due to high load. Please try again.";
        // Ensure image generation even if text fails
        const seed = (p.title || input.theme + p.pageNumber).replace(/[^a-z0-9]/gi, '-');
        p.image = `https://picsum.photos/seed/${seed}/800/1200`;
      }
    });
  }

  // Return backward compatible structure
  // We assume the caller handles the new structure, but let's fit it into GeneratedContent
  // The caller (route) expects { title, introduction, main_story, ... }

  // We will serialize the ENTIRE magazine structure into 'main_story' 
  // and provide summaries for other fields.
  const introPage = magazine.pages.find(p => p.type === 'INTRODUCTION');
  const summaryPage = magazine.pages.find(p => p.type === 'SUMMARY');
  const allImages = magazine.pages.filter(p => p.image).map(p => p.image!);

  return {
    title: magazine.title,
    introduction: introPage?.content || "Welcome to your magazine.",
    main_story: JSON.stringify(magazine), // KEY: Storing the whole structure here!
    character_highlights: summaryPage?.content || "",
    conclusion: "End of Magazine",
    images: allImages // Return explicit images array for route
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
