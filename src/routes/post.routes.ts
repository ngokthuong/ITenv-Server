import Router from 'express';
import {
  createPostController,
  deletePostByIdController,
  editPostByIdController,
  getPostByIdController,
  getPostsByUserIdController,
  getPostsWithCategoryIdAndTagsController,
  searchPostWithCategoryIdController,
  sharePostToProfileController,
  votePostController
} from '../controllers/post.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isAdmin, isUser } from '../middlewares/verify_roles';

const router = Router();

router.post('/create-post', verifyAccessToken, isUser, createPostController);
router.get('/all-posts/:categoryId', getPostsWithCategoryIdAndTagsController);
router.get('/:_id', getPostByIdController);
router.put('/edit-post', verifyAccessToken, isUser, isAdmin, editPostByIdController);
router.post('/vote/:_id', verifyAccessToken, isUser, isAdmin, votePostController);
router.get('/search/:categoryId', searchPostWithCategoryIdController);
router.get('/delete/:postId', verifyAccessToken, isUser, isAdmin, deletePostByIdController);
router.post('/share/:postId', verifyAccessToken, isUser, sharePostToProfileController);
router.get('/get/:postedBy', verifyAccessToken, isUser, getPostsByUserIdController);

export default router;
