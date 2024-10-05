import Router from 'express';
import { verifyAccessToken } from '../middleware/verifyToken.mdw';
import { createPostController } from '../controllers/post.controller';

const router = Router();

router.post('/', verifyAccessToken, createPostController);

export default router;
