import Router from 'express';
import { createPostController, getPostsWithCategoryIdController } from '../controllers/post.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';

const router = Router();

router.post('/create-post', verifyAccessToken, createPostController);
router.get('/all-pots', getPostsWithCategoryIdController);


export default router;
