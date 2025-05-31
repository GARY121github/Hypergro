import { Schema, model, Document } from 'mongoose';

export interface IProperty extends Document {
  propertyId: string;
  title: string;
  propertyType: string;
  price: number;
  state: string;
  city: string;
  areaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  furnished: 'Furnished' | 'Semi' | 'Unfurnished';
  availableFrom: Date;
  listedBy: 'Owner' | 'Agent' | 'Builder';
  tags: string[];
  colorTheme: string;
  rating: number;
  isVerified: boolean;
  listingType: 'sale' | 'rent';
  createdBy: Schema.Types.ObjectId;
  status: 'active' | 'inactive' | 'sold' | 'rented';
}

const propertySchema = new Schema<IProperty>(
  {
    propertyId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    propertyType: {
      type: String,
      required: true,
      enum: ['Apartment', 'Villa', 'Bungalow', 'Studio', 'Penthouse'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    areaSqFt: {
      type: Number,
      required: true,
      min: 0,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    amenities: [{
      type: String,
      trim: true,
    }],
    furnished: {
      type: String,
      required: true,
      enum: ['Furnished', 'Semi', 'Unfurnished'],
    },
    availableFrom: {
      type: Date,
      required: true,
    },
    listedBy: {
      type: String,
      required: true,
      enum: ['Owner', 'Agent', 'Builder'],
    },
    tags: [{
      type: String,
      trim: true,
    }],
    colorTheme: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    listingType: {
      type: String,
      required: true,
      enum: ['sale', 'rent'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'sold', 'rented'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
propertySchema.index({ propertyId: 1 });
propertySchema.index({ city: 1 });
propertySchema.index({ state: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ listingType: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ createdBy: 1 });

export const Property = model<IProperty>('Property', propertySchema); 