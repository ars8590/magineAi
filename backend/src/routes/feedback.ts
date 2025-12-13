import { Router } from 'express';
import { z } from 'zod';
import { saveFeedback } from '../services/storage';

const router = Router();

const schema = z.object({
  contentId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  userId: z.string().optional()
});

router.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  try {
    const { contentId, rating, comment, userId } = parsed.data;
    await saveFeedback(contentId, userId || null, rating, comment || '');
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || 'Failed to store feedback' });
  }
});

export default router;

