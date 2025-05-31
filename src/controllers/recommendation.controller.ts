import { Request, Response } from 'express';
import { Recommendation } from '../models/recommendation.model';
import { User } from '../models/user.model';
import { Property } from '../models/property.model';
import { AppError } from '../middlewares/error.middleware';
import { redisClient } from '../config/redis';

// Recommend a property to another user
export const recommendProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientEmail, propertyId } = req.body;
    const senderId = req.user?._id;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    // Find recipient user
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      throw new AppError(404, 'Recipient user not found');
    }

    // Check if already recommended
    const existingRecommendation = await Recommendation.findOne({
      sender: senderId,
      receiver: recipient._id,
      property: propertyId,
    });

    if (existingRecommendation) {
      throw new AppError(400, 'Property already recommended to this user');
    }

    // Create recommendation
    const recommendation = await Recommendation.create({
      sender: senderId,
      receiver: recipient._id,
      property: propertyId,
      message: req.body.message,
      status: 'pending',
    });

    // Add to user's received recommendations
    await User.findByIdAndUpdate(recipient._id, {
      $push: { receivedRecommendations: recommendation._id },
    });

    // Invalidate cache
    await redisClient.del(`recommendations:${recipient._id}`);

    res.status(201).json({
      message: 'Property recommended successfully',
      recommendation,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Error recommending property');
  }
};

// Get received recommendations
export const getReceivedRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    // Try to get from cache
    const cachedRecommendations = await redisClient.get(`recommendations:${userId}`);
    if (cachedRecommendations) {
      res.json({ recommendations: JSON.parse(cachedRecommendations) });
      return;
    }

    const recommendations = await Recommendation.find({ receiver: userId })
      .populate('sender', 'email')
      .populate('property', 'title description price city state images')
      .sort({ createdAt: -1 });

    // Cache the results
    await redisClient.setEx(`recommendations:${userId}`, 3600, JSON.stringify(recommendations));

    res.json({ recommendations });
  } catch (error) {
    throw new AppError(500, 'Error fetching recommendations');
  }
};

// Get sent recommendations
export const getSentRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const recommendations = await Recommendation.find({ sender: userId })
      .populate('receiver', 'email')
      .populate('property', 'title description price city state images')
      .sort({ createdAt: -1 });

    res.json({ recommendations });
  } catch (error) {
    throw new AppError(500, 'Error fetching sent recommendations');
  }
};

// Update recommendation status
export const updateRecommendationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?._id;

    const recommendation = await Recommendation.findById(id);
    if (!recommendation) {
      throw new AppError(404, 'Recommendation not found');
    }

    // Check if user is the receiver
    if (recommendation.receiver.toString() !== userId?.toString()) {
      throw new AppError(403, 'Not authorized to update this recommendation');
    }

    // Update status
    recommendation.status = status;
    await recommendation.save();

    // Invalidate cache
    await redisClient.del(`recommendations:${userId}`);

    res.json({
      message: 'Recommendation status updated',
      recommendation,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Error updating recommendation status');
  }
}; 