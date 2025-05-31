import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

export const cacheResponse = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        res.json(JSON.parse(cachedResponse));
        return;
      }

      // Store original send
      const originalSend = res.send;

      // Override send
      res.send = function (body: any): Response {
        // Store the response in cache
        redisClient.setEx(key, duration, JSON.stringify(body));
        
        // Call the original send
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Redis Cache Error:', error);
      next();
    }
  };
};

export const clearCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get all keys matching the pattern
      const keys = await redisClient.keys(pattern);
      
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      
      next();
    } catch (error) {
      console.error('Redis Clear Cache Error:', error);
      next();
    }
  };
}; 