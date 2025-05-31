import { User } from '../models/user.model';
import { Property } from '../models/property.model';
import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import path from 'path';

dotenv.config();

type UserRole = 'Owner' | 'Agent' | 'Builder';
type UsersByRole = Record<UserRole, mongoose.Document[]>;

// Dummy user data with roles matching the CSV listedBy field
const dummyUsers = [
  {
    email: 'owner1@example.com',
    password: 'password123',
    role: 'Owner' as UserRole
  },
  {
    email: 'owner2@example.com',
    password: 'password123',
    role: 'Owner' as UserRole
  },
  {
    email: 'agent1@example.com',
    password: 'password123',
    role: 'Agent' as UserRole
  },
  {
    email: 'agent2@example.com',
    password: 'password123',
    role: 'Agent' as UserRole
  },
  {
    email: 'builder1@example.com',
    password: 'password123',
    role: 'Builder' as UserRole
  },
  {
    email: 'builder2@example.com',
    password: 'password123',
    role: 'Builder' as UserRole
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});

    // Create users with hashed passwords
    const usersByRole: UsersByRole = {
      Owner: [],
      Agent: [],
      Builder: []
    };

    for (const userData of dummyUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        email: userData.email,
        password: hashedPassword,
      });
      usersByRole[userData.role].push(user);
    }

    // Read and process CSV file
    const properties: any[] = [];
    fs.createReadStream(path.join(__dirname, 'Data.csv'))
      .pipe(csv())
      .on('data', (data) => properties.push(data))
      .on('end', async () => {
        // Create properties
        await Promise.all(
          properties.map(async (prop) => {
            // Get appropriate user based on listedBy
            const roleUsers = usersByRole[prop.listedBy as UserRole];
            const randomUser = roleUsers[Math.floor(Math.random() * roleUsers.length)];

            const propertyData = {
              propertyId: prop.id,
              title: prop.title,
              propertyType: prop.type,
              price: parseFloat(prop.price),
              state: prop.state,
              city: prop.city,
              areaSqFt: parseFloat(prop.areaSqFt),
              bedrooms: parseInt(prop.bedrooms),
              bathrooms: parseFloat(prop.bathrooms),
              amenities: prop.amenities ? prop.amenities.split('|') : [],
              furnished: prop.furnished,
              availableFrom: new Date(prop.availableFrom),
              listedBy: prop.listedBy,
              tags: prop.tags ? prop.tags.split('|') : [],
              colorTheme: prop.colorTheme,
              rating: parseFloat(prop.rating),
              isVerified: prop.isVerified === 'True',
              listingType: prop.listingType.toLowerCase(),
              createdBy: randomUser._id,
              status: 'active'
            };

            await Property.create(propertyData);
          })
        );

        console.log('Seeding completed successfully');
        process.exit(0);
      });

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 