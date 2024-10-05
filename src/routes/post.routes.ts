import Router from 'express';
import { createPostController } from '../controllers/post.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';

const router = Router();

router.post('/', verifyAccessToken, createPostController);

export default router;
