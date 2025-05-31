import { Request, Response } from 'express';
import { Property } from '../models/property.model';
import { AppError } from '../middlewares/error.middleware';
import { redisClient } from '../config/redis';
import { CreatePropertyInput, UpdatePropertyInput, PropertyFilterInput } from '../validations/property.schema';

// Create property
export const createProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyData: CreatePropertyInput = req.body;
    const userId = req.user?._id;

    const property = await Property.create({
      ...propertyData,
      createdBy: userId,
    });

    res.status(201).json({
      message: 'Property created successfully',
      property,
    });
  } catch (error) {
    throw new AppError(500, 'Error creating property');
  }
};

// Get all properties with filtering
export const getProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: PropertyFilterInput = req.query;
    const page = parseInt(String(filters.page)) || 1;
    const limit = parseInt(String(filters.limit)) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const query: any = {};

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { city: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.city) query.city = { $regex: filters.city, $options: 'i' };
    if (filters.state) query.state = { $regex: filters.state, $options: 'i' };
    if (filters.propertyType) query.propertyType = filters.propertyType;
    if (filters.listingType) query.listingType = filters.listingType;
    if (filters.status) query.status = filters.status;

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = parseFloat(String(filters.minPrice));
      if (filters.maxPrice) query.price.$lte = parseFloat(String(filters.maxPrice));
    }

    if (filters.minBedrooms || filters.maxBedrooms) {
      query.bedrooms = {};
      if (filters.minBedrooms) query.bedrooms.$gte = parseInt(String(filters.minBedrooms));
      if (filters.maxBedrooms) query.bedrooms.$lte = parseInt(String(filters.maxBedrooms));
    }

    if (filters.minBathrooms || filters.maxBathrooms) {
      query.bathrooms = {};
      if (filters.minBathrooms) query.bathrooms.$gte = parseFloat(String(filters.minBathrooms));
      if (filters.maxBathrooms) query.bathrooms.$lte = parseFloat(String(filters.maxBathrooms));
    }

    if (filters.minArea || filters.maxArea) {
      query.area = {};
      if (filters.minArea) query.area.$gte = parseFloat(String(filters.minArea));
      if (filters.maxArea) query.area.$lte = parseFloat(String(filters.maxArea));
    }

    // Build sort query
    const sortQuery: any = {};
    if (filters.sortBy) {
      sortQuery[filters.sortBy] = filters.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortQuery.createdAt = -1; // Default sort by newest
    }

    const properties = await Property.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'email');

    const total = await Property.countDocuments(query);

    res.json({
      properties,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    throw new AppError(500, 'Error fetching properties');
  }
};

// Get property by ID
export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Try to get from cache first
    const cachedProperty = await redisClient.get(`property:${id}`);
    if (cachedProperty) {
      res.json({ property: JSON.parse(cachedProperty) });
      return;
    }

    const property = await Property.findById(id).populate('createdBy', 'email');
    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    // Cache the property
    await redisClient.setEx(`property:${id}`, 3600, JSON.stringify(property));

    res.json({ property });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Error fetching property');
  }
};

// Update property
export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: UpdatePropertyInput = req.body;
    const userId = req.user?._id;

    const property = await Property.findById(id);
    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    // Check ownership
    if (property.createdBy.toString() !== userId?.toString()) {
      throw new AppError(403, 'Not authorized to update this property');
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).populate('createdBy', 'email');

    // Invalidate cache
    await redisClient.del(`property:${id}`);

    res.json({
      message: 'Property updated successfully',
      property: updatedProperty,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Error updating property');
  }
};

// Delete property
export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const property = await Property.findById(id);
    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    // Check ownership
    if (property.createdBy.toString() !== userId?.toString()) {
      throw new AppError(403, 'Not authorized to delete this property');
    }

    await Property.findByIdAndDelete(id);

    // Invalidate cache
    await redisClient.del(`property:${id}`);

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Error deleting property');
  }
}; 