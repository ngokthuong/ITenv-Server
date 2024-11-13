import Router from 'express';
import uploadCloud from '../config/cloudinary';
import {
  deleteImageController,
  uploadSingleImageController,
} from '../controllers/upload.controller';
const router = Router();

router.post('/image', uploadCloud.single('image'), uploadSingleImageController);
router.post('/delete-image', deleteImageController);

export default router;
