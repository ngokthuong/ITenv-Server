import Router from 'express';
import uploadCloud from '../config/cloudinary';
import {
  deleteImageController,
  uploadSingleImageController,
} from '../controllers/upload.controller';
const router = Router();

router.post('', uploadCloud.single('image'), uploadSingleImageController);
router.post('', deleteImageController);

export default router;
