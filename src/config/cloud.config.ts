import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

export const connectCloudinary = (): void => {
  const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error("❌ Missing Cloudinary environment variables");
  }

  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
  });

  console.log("Cloudinary connected");
};

// import { v2 as cloudinary } from 'cloudinary';
// import dotenv from 'dotenv';

// dotenv.config();

// export const connectCloudinary = () => {
//     const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

//     if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
//         console.error('Missing Cloudinary environment variables.');
//         return;
//     }

//     cloudinary.config({
//         cloud_name: CLOUD_NAME,
//         api_key: API_KEY,
//         api_secret: API_SECRET,
//     });

//     console.log('💥💥Connected to Cloudinary successfully.');
// };