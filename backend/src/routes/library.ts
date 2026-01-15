import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getUserLibrary, fetchGeneratedContent } from '../services/storage';

const router = Router();

// Get all content for the authenticated user
router.get('/', requireAuth, async (req, res) => {
    try {
        // middleware: res.locals.user = { id: payload.sub }
        // middleware: res.locals.admin = payload (which has .sub)
        const userId = res.locals.user?.id || res.locals.admin?.sub;
        if (!userId) {
            // Should be caught by requireAuth, but double check
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const library = await getUserLibrary(userId);
        return res.json(library);
    } catch (err: any) {
        console.error('Library fetch error:', err);
        return res.status(500).json({ message: 'Failed to fetch library' });
    }
});

// Get single content item details
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const content = await fetchGeneratedContent(id);

        // simple ownership check
        const userId = res.locals.user?.id || res.locals.admin?.sub;
        if (content.user_id !== userId && !res.locals.admin) { // Allow admins or owner
            return res.status(403).json({ message: 'Forbidden' });
        }

        return res.json(content);
    } catch (err: any) {
        console.error('Content fetch error:', err);
        return res.status(500).json({ message: 'Failed to fetch content' });
    }
});

import { deleteGeneratedContent } from '../services/storage';

router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const content = await fetchGeneratedContent(id);

        const userId = res.locals.user?.id || res.locals.admin?.sub;
        if (content.user_id !== userId && !res.locals.admin) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await deleteGeneratedContent(id);
        return res.json({ ok: true });
    } catch (err: any) {
        console.error('Delete error:', err);
        return res.status(500).json({ message: 'Failed to delete content' });
    }
});

export default router;
