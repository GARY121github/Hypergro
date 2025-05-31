import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

console.log(REDIS_URL);

export const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected Successfully');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis Connection Error:', error);
    process.exit(1);
  }
};

// Cache middleware
export const cacheMiddleware = (duration: number) => {
  return async (req: any, res: any, next: any) => {
    const key = `__express__${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // Store the original send function
      const originalSend = res.send;

      // Override the send function
      res.send = function (body: any) {
        // Store the response in cache
        redisClient.setEx(key, duration, JSON.stringify(body));
        
        // Call the original send function
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Redis Cache Error:', error);
      next();
    }
  };
}; 