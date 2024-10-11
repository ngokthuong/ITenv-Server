import { Router } from 'express';
import { getAllTagsController } from '../controllers/tag.controller';

const router = Router();
router.get('/all-tags', getAllTagsController);

export default router