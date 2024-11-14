import Router from 'express';
import {
  createPostController,
  deletePostByIdController,
  editPostByIdController,
  getPostByIdController,
  getPostsByUserIdController,
  getPostsWithCategoryIdAndTagsController,
  getPostsController,
  searchPostWithCategoryIdController,
  sharePostToProfileController,
  votePostController,
} from '../controllers/post.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isAdmin, isUser } from '../middlewares/verify_roles';

const router = Router();

router.post('', verifyAccessToken, isUser, createPostController);
router.get('/category/:categoryId', getPostsWithCategoryIdAndTagsController);
router.get('/:_id', getPostByIdController);
// router.put('', verifyAccessToken, isUser, editPostByIdController);
router.post('/vote/:_id', verifyAccessToken, isUser, votePostController);
// router.get('/search/:categoryId', searchPostWithCategoryIdController);
router.delete('/:postId', verifyAccessToken, isUser, deletePostByIdController);
router.post('/share/:postId', verifyAccessToken, isUser, sharePostToProfileController);
router.get('/:postedBy', verifyAccessToken, isUser, getPostsByUserIdController);
router.get('', verifyAccessToken, isUser, getPostsController);

export default router;
