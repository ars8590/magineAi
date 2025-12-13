import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../middleware/auth';
import { moderateContentRecord } from '../services/storage';

const router = Router();

const schema = z.object({
  contentId: z.string(),
  action: z.enum(['approve', 'reject'])
});

router.post('/moderate', requireAdmin, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });
  const { contentId, action } = parsed.data;
  try {
    await moderateContentRecord(contentId, action === 'approve' ? 'approved' : 'rejected');
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || 'Unable to update status' });
  }
});

export default router;

