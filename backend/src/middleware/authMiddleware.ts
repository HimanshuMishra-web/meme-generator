import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtUserPayload {
  id: string;
  role: string;
  permissions: any;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload;
    req.user = {
      id: decoded.id,
      role: decoded.role,
      permissions: decoded.permissions
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
} 