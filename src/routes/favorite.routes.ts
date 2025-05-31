import { Router } from 'express';
import {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
  updateFavoriteNotes,
} from '../controllers/favorite.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheResponse } from '../middlewares/redis.middleware';
import { addFavoriteSchema, updateFavoriteNotesSchema } from '../validations/favorite.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's favorites
router.get('/', cacheResponse(300), getFavorites);

// Add to favorites
router.post('/:propertyId', validate(addFavoriteSchema), addToFavorites);

// Remove from favorites
router.delete('/:propertyId', removeFromFavorites);

// Update favorite notes
router.patch('/:propertyId/notes', validate(updateFavoriteNotesSchema), updateFavoriteNotes);

export default router; 