import { Router } from 'express';
import { createTagController, getAllTagsController } from '../controllers/tag.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isAdmin } from '../middlewares/verify_roles';

const router = Router();
router.post('', verifyAccessToken, isAdmin, createTagController);
router.get('', getAllTagsController);

export default router;
