import { Router } from 'express';
import {
  recommendProperty,
  getReceivedRecommendations,
  getSentRecommendations,
  updateRecommendationStatus,
} from '../controllers/recommendation.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheResponse } from '../middlewares/redis.middleware';
import {
  recommendPropertySchema,
  updateRecommendationStatusSchema,
} from '../validations/recommendation.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get recommendations
router.get('/received', cacheResponse(300), getReceivedRecommendations);
router.get('/sent', getSentRecommendations);

// Recommend a property
router.post('/', validate(recommendPropertySchema), recommendProperty);

// Update recommendation status
router.patch('/:id/status', validate(updateRecommendationStatusSchema), updateRecommendationStatus);

export default router; 