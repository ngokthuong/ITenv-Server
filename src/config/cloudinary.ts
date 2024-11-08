import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || 'dcti265mg',
  api_key: process.env.CLOUDINARY_KEY || '358958191412178',
  api_secret: process.env.CLOUDINARY_SECRET || 'j5e36_RDdn-FUB5dFFusjhQ52To',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'users/imgs',
    allowed_formats: ['jpg', 'png', 'mp4', 'mp3', 'doc', 'docx', 'mkv'],

  } as {
    folder: string;
    format:
    | string
    | ((req: Express.Request, file: Express.Multer.File) => string | Promise<string>);
    allowed_formats?: string[];
  },
});
const uploadCloud = multer({ storage });

export default uploadCloud;
