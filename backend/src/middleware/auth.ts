import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Missing Authorization header' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { role: string };
    if (payload.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    res.locals.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

