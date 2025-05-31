import { Request, Response } from 'express';
import { User, IUser } from '../models/user.model';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middlewares/error.middleware';
import { RegisterInput, LoginInput } from '../validations/auth.schema';
import { Types } from 'mongoose';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: RegisterInput = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    // Create new user
    const user = await User.create({
      email,
      password,
    }) as IUser;

    // Generate token
    const token = generateToken({
      userId: (user._id as Types.ObjectId).toString(),
      email: user.email,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Error registering user');
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginInput = req.body;

    // Find user
    const user = await User.findOne({ email }) as IUser;
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken({
      userId: (user._id as Types.ObjectId).toString(),
      email: user.email,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Error logging in');
  }
}; 