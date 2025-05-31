import { z } from 'zod';

export const recommendPropertySchema = z.object({
  body: z.object({
    recipientEmail: z.string().email('Invalid email format'),
    propertyId: z.string().min(1, 'Property ID is required'),
    message: z.string().optional(),
  }),
});

export const updateRecommendationStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Recommendation ID is required'),
  }),
  body: z.object({
    status: z.enum(['pending', 'viewed', 'saved', 'rejected']),
  }),
});

export type RecommendPropertyInput = z.infer<typeof recommendPropertySchema>['body'];
export type UpdateRecommendationStatusInput = z.infer<typeof updateRecommendationStatusSchema>['body']; 