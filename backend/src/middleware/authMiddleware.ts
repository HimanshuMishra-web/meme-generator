import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

interface JwtUserPayload {
  id: string;
  role: string;
  permissions: any;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: any;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader); // Debug log
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid auth header found'); // Debug log
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  console.log('Token received:', token ? `${token.substring(0, 20)}...` : 'null'); // Debug log
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey") as JwtUserPayload;
    console.log('Token decoded successfully:', decoded); // Debug log
    req.user = {
      id: decoded.id,
      role: decoded.role,
      permissions: decoded.permissions
    };
    next();
  } catch (err) {
    console.log('Token verification failed:', err); // Debug log
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// Super Admin middleware
export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'super_admin') {
    res.status(403).json({ message: 'Forbidden: Super Admin access required.' });
    return;
  }
  next();
}

// Admin or Super Admin middleware
export function requireAdminOrSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
    res.status(403).json({ message: 'Forbidden: Admin or Super Admin access required.' });
    return;
  }
  next();
} 