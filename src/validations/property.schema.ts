import { z } from 'zod';

const propertyTypes = [
  'Apartment',
  'Villa',
  'Bungalow',
  'Studio',
  'Penthouse'
] as const;

const listingTypes = ['sale', 'rent'] as const;
const propertyStatus = ['active', 'inactive', 'sold', 'rented'] as const;
const furnishedTypes = ['Furnished', 'Semi', 'Unfurnished'] as const;
const listedByTypes = ['Owner', 'Agent', 'Builder'] as const;

export const createPropertySchema = z.object({
  body: z.object({
    propertyId: z.string(),
    title: z.string().min(3).max(100),
    propertyType: z.enum(propertyTypes),
    price: z.number().positive(),
    state: z.string().min(2).max(50),
    city: z.string().min(2).max(50),
    areaSqFt: z.number().positive(),
    bedrooms: z.number().int().min(0),
    bathrooms: z.number().min(0),
    amenities: z.array(z.string()),
    furnished: z.enum(furnishedTypes),
    availableFrom: z.string().transform((str) => new Date(str)),
    listedBy: z.enum(listedByTypes),
    tags: z.array(z.string()),
    colorTheme: z.string(),
    rating: z.number().min(0).max(5),
    isVerified: z.boolean(),
    listingType: z.enum(listingTypes),
    status: z.enum(propertyStatus).default('active'),
  }),
});

export const updatePropertySchema = createPropertySchema.deepPartial();

export const propertyFilterSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
    minBedrooms: z.string().transform(Number).optional(),
    maxBedrooms: z.string().transform(Number).optional(),
    minBathrooms: z.string().transform(Number).optional(),
    maxBathrooms: z.string().transform(Number).optional(),
    minArea: z.string().transform(Number).optional(),
    maxArea: z.string().transform(Number).optional(),
    propertyType: z.enum(propertyTypes).optional(),
    furnished: z.enum(furnishedTypes).optional(),
    listedBy: z.enum(listedByTypes).optional(),
    minRating: z.string().transform(Number).optional(),
    isVerified: z.boolean().optional(),
    listingType: z.enum(listingTypes).optional(),
    status: z.enum(propertyStatus).optional(),
    sortBy: z.enum(['price', 'createdAt', 'rating', 'areaSqFt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>['body'];
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>['body'];
export type PropertyFilterInput = z.infer<typeof propertyFilterSchema>['query']; 