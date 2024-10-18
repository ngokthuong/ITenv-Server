import Router from 'express';
import {
  createPostController,
  editPostByIdController,
  getPostByIdController,
  getPostsWithCategoryIdController,
  votePostController
} from '../controllers/post.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';

const router = Router();

router.post('/create-post', verifyAccessToken, createPostController);
router.get('/all-posts/:categoryId', getPostsWithCategoryIdController);
router.get('/:_id', getPostByIdController);
router.put('/edit-post', verifyAccessToken, editPostByIdController);
router.post('/vote/:_id', verifyAccessToken, votePostController);

export default router;
