import Router from 'express';
import { createPostController, getAllPostsController } from '../controllers/post.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';

const router = Router();

router.post('/', verifyAccessToken, createPostController);
router.get('/', getAllPostsController);


export default router;
