import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
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
  pages: z.number().min(1).max(100).optional(),
  userId: z.string().optional()
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = payloadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.errors });
  const input = parsed.data as GenerationRequest & { userId?: string };

  try {
    const story = await generateStory(input);
    // await moderateOutput(story); // structured content might not fit simple moderation map

    // Use images from the story generation or fallback
    const generatedImages = story.images || [];

    // Upload images to Supabase Storage and store the public URLs
    const storedImages = await Promise.all(
      generatedImages.map(async (url: string) => {
        try {
          return await uploadImageFromUrl(url);
        } catch (err) {
          console.warn('Image upload failed, keeping original URL:', err);
          return url;
        }
      })
    );

    console.log('Generated images:', generatedImages);
    console.log('Number of images:', generatedImages.length);

    // Extract user ID from authenticated session (middleware)
    // Priority: res.locals.user.id -> res.locals.admin.sub -> input.userId -> null
    // Extract user ID from authenticated session
    let userId = res.locals.user?.id || input.userId || null;

    if (!userId && res.locals.admin?.sub) {
      // If Admin, resolve to their Shadow User ID to satisfy FK constraints
      const { getOrCreateShadowUser } = await import('../services/storage');
      userId = await getOrCreateShadowUser(res.locals.admin.sub);
    }

    console.log('Saving content for User ID:', userId);

    await savePreference(userId, input);
    const record = await saveGeneratedContent(userId, {
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

