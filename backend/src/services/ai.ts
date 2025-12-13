import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerationRequest } from '../types';
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

function createStoryPrompt(input: GenerationRequest): string {
  return `Generate a personalized magazine-style story for a ${input.age}-year-old reader.

Requirements:
- Genre: ${input.genre}
- Theme: ${input.theme}
- Keywords to incorporate: ${input.keywords}
- Language: ${input.language}
- Age-appropriate content (suitable for ${input.age} years old)
- Positive, educational, and engaging

Structure your response EXACTLY in the following JSON format (no markdown, just valid JSON):
{
  "title": "Story title here",
  "introduction": "A brief introduction paragraph (2-3 sentences)",
  "main_story": "The main story content (3-5 paragraphs, engaging narrative)",
  "character_highlights": "Description of key characters and their traits (1-2 paragraphs)",
  "conclusion": "A meaningful conclusion with a positive message or moral (1-2 paragraphs)"
}

Important:
- Make the story age-appropriate and safe
- Incorporate the keywords naturally
- Use the specified language
- Keep content positive and educational
- Return ONLY valid JSON, no additional text before or after`;
}

function parseStoryResponse(response: string): {
  title: string;
  introduction: string;
  main_story: string;
  character_highlights: string;
  conclusion: string;
} {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
    cleaned = cleaned.trim();

    // Try to extract JSON object from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || 'Untitled Story',
        introduction: parsed.introduction || '',
        main_story: parsed.main_story || '',
        character_highlights: parsed.character_highlights || '',
        conclusion: parsed.conclusion || ''
      };
    }
    // Fallback: try parsing the whole cleaned response
    return JSON.parse(cleaned);
  } catch (error) {
    // If JSON parsing fails, create a structured response from the text
    console.warn('Failed to parse JSON response, using fallback:', error);
    const lines = response.split('\n').filter((l) => l.trim());
    return {
      title: lines[0] || 'Personalized Story',
      introduction: lines.slice(1, 3).join(' ') || 'Welcome to this personalized story.',
      main_story: lines.slice(3, 8).join(' ') || response.substring(0, 500),
      character_highlights: lines.slice(8, 10).join(' ') || 'The characters in this story are engaging and relatable.',
      conclusion: lines.slice(10).join(' ') || 'This story teaches valuable lessons about friendship and growth.'
    };
  }
}

export async function generateStory(input: GenerationRequest) {
  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const genAI = getGenAI();
      // Use gemini-2.5-flash (available on free tier: 5 RPM, 20 RPD)
      // Free tier limits: 5 requests/min, 250K tokens/min, 20 requests/day
      const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

      const prompt = createStoryPrompt(input);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const story = parseStoryResponse(text);
      return story;
    } catch (error: any) {
      lastError = error;
      
      // If it's a quota/rate limit error, wait and retry
      if (error.status === 429 && attempt < maxRetries) {
        const retryDelay = error.errorDetails?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay;
        const delaySeconds = retryDelay ? parseFloat(retryDelay.replace('s', '')) : Math.pow(2, attempt) * 5;
        
        console.warn(`Quota exceeded. Retrying in ${delaySeconds} seconds... (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        continue;
      }
      
      // For other errors or max retries reached, break and fallback
      break;
    }
  }

  // Fallback to mock data if API fails after retries
  console.warn('Falling back to mock story generation after', maxRetries + 1, 'attempts');
  if (lastError) {
    console.error('Last error:', lastError.status === 429 ? 'Quota exceeded' : lastError.message);
  }
  
  return {
    title: `${input.genre} tale: ${input.theme}`,
    introduction: `A tailored magazine story for a ${input.age}-year-old reader set in a ${input.genre.toLowerCase()} world.`,
    main_story: `In a realm of ${input.theme.toLowerCase()}, characters embark on a journey around ${input.keywords}. With each step they learn courage and empathy.`,
    character_highlights: `Key characters embody the keywords: ${input.keywords}. They mirror the reader's curiosity and kindness.`,
    conclusion: `The adventure ends with a gentle lesson suited for ${input.language} readers, celebrating growth and imagination.`
  };
}

export async function generateImages(input: GenerationRequest) {
  const maxRetries = 1; // Only 1 retry for images since they're less critical
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Use Gemini to generate image search prompts based on the story theme
      // Using gemini-2.5-flash (available on free tier)
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    const imagePrompt = `Generate 2-3 specific, child-friendly image search keywords/phrases for a ${input.age}-year-old's ${input.genre} story about ${input.theme}. 
    
Keywords to incorporate: ${input.keywords}
Age: ${input.age} (must be age-appropriate)
Genre: ${input.genre}
Theme: ${input.theme}

Return ONLY a JSON array of 2-3 search phrases (no other text), like:
["search phrase 1", "search phrase 2", "search phrase 3"]

Make the phrases specific, positive, and suitable for children. Focus on the main visual elements of the story.`;

    const result = await model.generateContent(imagePrompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse the search phrases from Gemini
    let searchPhrases: string[] = [];
    try {
      // Try to extract JSON array
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        searchPhrases = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by lines or commas
        searchPhrases = text
          .replace(/["\[\]]/g, '')
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .slice(0, 3);
      }
    } catch (error) {
      console.warn('Failed to parse image search phrases, using fallback:', error);
      // Fallback search phrases based on input
      searchPhrases = [
        `${input.theme} ${input.genre} illustration`,
        `${input.keywords} children story`,
        `${input.genre} adventure illustration`
      ].slice(0, 2);
    }

    // Generate image URLs using reliable free image services
    const imageUrls: string[] = [];
    
    // Create unique seeds based on search phrases for consistent images
    for (let i = 0; i < 2; i++) {
      try {
        const phrase = searchPhrases[i] || searchPhrases[0] || `${input.theme} ${input.genre}`;
        
        // Create a consistent seed from the phrase
        const seed = phrase
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50); // Limit length
        
        // Use multiple reliable image services as fallbacks
        // Primary: Picsum Photos (very reliable)
        const imageId = Math.abs(phrase.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 1000;
        const imageUrl = `https://picsum.photos/seed/${seed}-${imageId}/1200/800`;
        imageUrls.push(imageUrl);
        
        console.log(`Generated image URL ${i + 1} for phrase: "${phrase}" -> ${imageUrl}`);
      } catch (error) {
        console.warn(`Failed to generate image URL ${i + 1}:`, error);
        // Fallback
        const fallbackSeed = `${input.theme}-${input.genre}-${i}`.replace(/\s+/g, '-').toLowerCase();
        imageUrls.push(`https://picsum.photos/seed/${fallbackSeed}/1200/800`);
      }
    }

    // Ensure we have exactly 2 images
    if (imageUrls.length < 2) {
      for (let i = imageUrls.length; i < 2; i++) {
        const fallbackSeed = `${input.theme}-fallback-${i}`.replace(/\s+/g, '-').toLowerCase();
        imageUrls.push(`https://picsum.photos/seed/${fallbackSeed}/1200/800`);
      }
    }

      console.log(`Returning ${imageUrls.length} image URLs:`, imageUrls);
      return imageUrls.slice(0, 2); // Return exactly 2 images
    } catch (error: any) {
      lastError = error;
      
      // If it's a quota/rate limit error, wait and retry
      if (error.status === 429 && attempt < maxRetries) {
        const retryDelay = error.errorDetails?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay;
        const delaySeconds = retryDelay ? parseFloat(retryDelay.replace('s', '')) : 30;
        
        console.warn(`Image generation quota exceeded. Retrying in ${delaySeconds} seconds... (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        continue;
      }
      
      // For other errors or max retries reached, break and fallback
      break;
    }
  }

  // Fallback to Picsum Photos with theme-based seeds if API fails
  console.warn('Falling back to theme-based images after', maxRetries + 1, 'attempts');
  if (lastError) {
    console.error('Last error:', lastError.status === 429 ? 'Quota exceeded' : lastError.message);
  }
  
  const themeSeed = `${input.theme}-${input.genre}`.replace(/\s+/g, '-');
  const keywordSeed = input.keywords.replace(/\s+/g, '-');
  
  return [
    `https://picsum.photos/seed/${themeSeed}-1/1200/800`,
    `https://picsum.photos/seed/${keywordSeed}-2/1200/800`
  ];
}

export function isUnsafe(text: string) {
  return unsafePatterns.some((pattern) => pattern.test(text));
}

export async function moderateOutput(sections: Record<string, string>, retries = 2) {
  let attempts = 0;
  while (attempts <= retries) {
    const unsafe = Object.values(sections).some((s) => isUnsafe(s));
    if (!unsafe) return sections;
    attempts += 1;
    if (attempts > retries) throw new Error('Content rejected. Please revise your inputs.');
  }
  throw new Error('Content rejected. Please revise your inputs.');
}

