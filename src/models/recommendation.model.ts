import { Schema, model, Document } from 'mongoose';

export interface IRecommendation extends Document {
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  property: Schema.Types.ObjectId;
  message?: string;
  status: 'pending' | 'viewed' | 'saved' | 'rejected';
}

const recommendationSchema = new Schema<IRecommendation>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'viewed', 'saved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
recommendationSchema.index({ sender: 1, receiver: 1 });
recommendationSchema.index({ receiver: 1, status: 1 });
recommendationSchema.index({ property: 1 });

export const Recommendation = model<IRecommendation>('Recommendation', recommendationSchema); 