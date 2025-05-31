import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import axios from 'axios';
import { connectDB } from '../config/db';
import { Property } from '../models/property.model';
import dotenv from 'dotenv';

dotenv.config();

const CSV_URL = process.env.CSV_URL || 'https://cdn2.gro.care/db424fd9fb74_1748258398689.csv';
const TEMP_FILE_PATH = path.join(__dirname, '../../temp/properties.csv');

interface CSVProperty {
  title: string;
  description: string;
  price: string;
  city: string;
  state: string;
  zipCode: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  yearBuilt: string;
  propertyType: string;
  listingType: string;
  amenities?: string;
  images?: string;
}

const downloadCSV = async (): Promise<void> => {
  try {
    // Create temp directory if it doesn't exist
    const tempDir = path.dirname(TEMP_FILE_PATH);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const response = await axios({
      method: 'GET',
      url: CSV_URL,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(TEMP_FILE_PATH);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw error;
  }
};

const importProperties = async (): Promise<void> => {
  try {
    await connectDB();
    await downloadCSV();

    const properties: CSVProperty[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(TEMP_FILE_PATH)
        .pipe(csv())
        .on('data', (data: CSVProperty) => {
          properties.push(data);
        })
        .on('end', async () => {
          try {
            // Transform and insert properties
            const transformedProperties = properties.map((prop) => ({
              title: prop.title,
              description: prop.description,
              price: parseFloat(prop.price),
              city: prop.city,
              state: prop.state,
              zipCode: prop.zipCode,
              address: prop.address,
              bedrooms: parseInt(prop.bedrooms, 10),
              bathrooms: parseFloat(prop.bathrooms),
              area: parseFloat(prop.area),
              yearBuilt: parseInt(prop.yearBuilt, 10),
              propertyType: prop.propertyType.toLowerCase(),
              listingType: prop.listingType.toLowerCase(),
              amenities: prop.amenities ? prop.amenities.split(',').map((a) => a.trim()) : [],
              images: prop.images ? prop.images.split(',').map((i) => i.trim()) : [],
              status: 'active',
            }));

            await Property.insertMany(transformedProperties);
            console.log(`Successfully imported ${properties.length} properties`);
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });

    // Clean up temp file
    fs.unlinkSync(TEMP_FILE_PATH);
  } catch (error) {
    console.error('Error importing properties:', error);
    throw error;
  }
};

// Run the import if this file is executed directly
if (require.main === module) {
  importProperties()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 