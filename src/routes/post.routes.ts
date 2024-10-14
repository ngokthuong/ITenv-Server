import Router from 'express';
import { createPostController, editPostByIdController, getPostByIdController, getPostsWithCategoryIdController } from '../controllers/post.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';

const router = Router();

router.post('/create-post', verifyAccessToken, createPostController);
router.get('/all-posts', getPostsWithCategoryIdController);
router.get('/:_id', getPostByIdController);
router.put('/edit-post', verifyAccessToken, editPostByIdController);


export default router;
