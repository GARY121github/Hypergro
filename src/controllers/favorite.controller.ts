import { Request, Response } from 'express';
import { Favorite } from '../models/favorite.model';
import { Property } from '../models/property.model';
import { User } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { redisClient } from '../config/redis';

// Add property to favorites
export const addToFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const userId = req.user?._id;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({ user: userId, property: propertyId });
    if (existingFavorite) {
      throw new AppError(400, 'Property already in favorites');
    }

    // Add to favorites
    const favorite = await Favorite.create({
      user: userId,
      property: propertyId,
      notes: req.body.notes,
    });

    // Add to user's favorites array
    await User.findByIdAndUpdate(userId, {
      $push: { favorites: propertyId },
    });

    // Invalidate cache
    await redisClient.del(`favorites:${userId}`);

    res.status(201).json({
      message: 'Added to favorites',
      favorite,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Error adding to favorites');
  }
};

// Get user's favorites
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    // Try to get from cache
    const cachedFavorites = await redisClient.get(`favorites:${userId}`);
    if (cachedFavorites) {
      res.json({ favorites: JSON.parse(cachedFavorites) });
      return;
    }

    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: 'property',
        select: 'title description price city state images',
      })
      .sort({ createdAt: -1 });

    // Cache the results
    await redisClient.setEx(`favorites:${userId}`, 3600, JSON.stringify(favorites));

    res.json({ favorites });
  } catch (error) {
    throw new AppError(500, 'Error fetching favorites');
  }
};

// Remove from favorites
export const removeFromFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const userId = req.user?._id;

    // Remove favorite
    const result = await Favorite.findOneAndDelete({
      user: userId,
      property: propertyId,
    });

    if (!result) {
      throw new AppError(404, 'Favorite not found');
    }

    // Remove from user's favorites array
    await User.findByIdAndUpdate(userId, {
      $pull: { favorites: propertyId },
    });

    // Invalidate cache
    await redisClient.del(`favorites:${userId}`);

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Error removing from favorites');
  }
};

// Update favorite notes
export const updateFavoriteNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const userId = req.user?._id;
    const { notes } = req.body;

    const favorite = await Favorite.findOneAndUpdate(
      { user: userId, property: propertyId },
      { notes },
      { new: true }
    );

    if (!favorite) {
      throw new AppError(404, 'Favorite not found');
    }

    // Invalidate cache
    await redisClient.del(`favorites:${userId}`);

    res.json({
      message: 'Notes updated',
      favorite,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Error updating favorite notes');
  }
}; 