import { Router } from 'express';
import { z } from 'zod';
import { generateImages, generateStory, moderateOutput } from '../services/ai';
import { saveGeneratedContent, savePreference, uploadImageFromUrl } from '../services/storage';
import { GenerationRequest } from '../types';

const router = Router();

const payloadSchema = z.object({
  age: z.number().min(3).max(120),
  genre: z.string().min(2),
  theme: z.string().min(2),
  keywords: z.string().min(2),
  language: z.string().min(2),
  pages: z.number().min(10).max(100).optional(),
  userId: z.string().optional()
});

router.post('/', async (req, res) => {
  const parsed = payloadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.errors });
  const input = parsed.data as GenerationRequest & { userId?: string };

  try {
    const story = await generateStory(input);
    await moderateOutput(story);
    const images = await generateImages(input);

    // Upload images to Supabase Storage and store the public URLs
    const storedImages = await Promise.all(
      images.map(async (url) => {
        try {
          return await uploadImageFromUrl(url);
        } catch (err) {
          console.warn('Image upload failed, keeping original URL:', err);
          return url;
        }
      })
    );

    console.log('Generated images:', images);
    console.log('Number of images:', images.length);

    await savePreference(input.userId || null, input);
    const record = await saveGeneratedContent(input.userId || null, {
      title: story.title,
      introduction: story.introduction,
      main_story: story.main_story,
      character_highlights: story.character_highlights,
      conclusion: story.conclusion,
      image_urls: storedImages,
      status: 'pending'
    });

    console.log('Saved content with images:', record.image_urls);
    return res.status(200).json({ id: record.id });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err?.message || 'Generation failed. Please try again.' });
  }
});

export default router;

