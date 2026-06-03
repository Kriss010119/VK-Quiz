import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('No authorization header');
    return res.status(401).json({ error: 'No authorization header' });
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('Invalid authorization format');
    return res.status(401).json({ error: 'Invalid authorization format' });
  }
  
  const token = parts[1];
  
  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      console.log('Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = { id: decoded.id, email: decoded.email };
    console.log('User authenticated:', req.user.id);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};