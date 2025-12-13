import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { config } from '../config';
import { findAdmin } from '../services/storage';

const router = Router();

const schema = z.object({
  username: z.string(),
  password: z.string()
});

router.post('/login', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  try {
    const admin = await findAdmin(parsed.data.username);
    const valid = admin?.password_hash
      ? bcrypt.compareSync(parsed.data.password, admin.password_hash)
      : false;
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ role: 'admin', sub: admin.id }, config.jwtSecret, { expiresIn: '12h' });
    return res.status(200).json({ token });
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || 'Login failed' });
  }
});

export default router;

