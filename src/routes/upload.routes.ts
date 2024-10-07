import Router from 'express';
import uploader from '../config/cloudinary';
import {
  deleteImageController,
  uploadSingleImageController,
} from '../controllers/upload.controller';
const router = Router();

router.post('/image', uploader.single('image'), uploadSingleImageController);
router.post('/delete-image', deleteImageController);

export default router;
