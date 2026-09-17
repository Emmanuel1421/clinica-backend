import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Não autenticado.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env['JWT_SECRET'];

  if (!secret) {
    res.status(500).json({ success: false, message: 'Erro interno.' });
    return;
  }

  try {
    const decoded = jwt.verify(token!, secret) as { id: string };
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
  }
}
