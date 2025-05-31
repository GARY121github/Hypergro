import { z } from 'zod';

export const addFavoriteSchema = z.object({
  body: z.object({
    notes: z.string().optional(),
  }),
  params: z.object({
    propertyId: z.string().min(1, 'Property ID is required'),
  }),
});

export const updateFavoriteNotesSchema = z.object({
  body: z.object({
    notes: z.string().min(1, 'Notes are required'),
  }),
  params: z.object({
    propertyId: z.string().min(1, 'Property ID is required'),
  }),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>['body'];
export type UpdateFavoriteNotesInput = z.infer<typeof updateFavoriteNotesSchema>['body']; 