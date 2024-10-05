import Router from 'express';
import uploader from '../config/cloudinary';
import { uploadController } from '../controllers/upload.controller';
const router = Router();

router.post('/image', uploader.single('image'), uploadController);

export default router;
