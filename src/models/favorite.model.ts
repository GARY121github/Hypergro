import { Schema, model, Document } from 'mongoose';

export interface IFavorite extends Document {
  user: Schema.Types.ObjectId;
  property: Schema.Types.ObjectId;
  notes?: string;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for user-property combination to ensure uniqueness
favoriteSchema.index({ user: 1, property: 1 }, { unique: true });

export const Favorite = model<IFavorite>('Favorite', favoriteSchema); 