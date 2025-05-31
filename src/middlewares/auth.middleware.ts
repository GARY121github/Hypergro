import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { User } from '../models/user.model';

// Extend Express Request type to include user and model
declare global {
  namespace Express {
    interface Request {
      user?: any;
      model?: any;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: 'No authorization header' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const isOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resourceId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Check if the resource belongs to the user
    const resource = await req.model?.findById(resourceId);
    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    if (resource.createdBy?.toString() !== userId.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 