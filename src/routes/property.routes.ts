import { Router } from 'express';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '../controllers/property.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheResponse } from '../middlewares/redis.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyFilterSchema,
} from '../validations/property.schema';

const router = Router();

// Public routes
router.get('/', validate(propertyFilterSchema), cacheResponse(300), getProperties);
router.get('/:id', cacheResponse(300), getPropertyById);

// Protected routes
router.use(authenticate);
router.post('/', validate(createPropertySchema), createProperty);
router.put('/:id', validate(updatePropertySchema), updateProperty);
router.delete('/:id', deleteProperty);

export default router; 