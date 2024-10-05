import Router from 'express';
import { verifyAccessToken } from '../middleware/verifyToken.mdw';
import { getAllUser, getCurrentUser } from '../controllers/user.controller';
import { uploadController } from '../controllers/upload.controller';
import uploader from '../config/cloudinary'
const router = Router();

router.post('/image',uploader.single('image'), uploadController);

export default router;
