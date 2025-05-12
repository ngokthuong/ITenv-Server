import Router from 'express';
import {
  createPostController,
  deletePostByIdController,
  getPostByIdController,
  getPostsByUserIdController,
  getPostsWithCategoryIdAndTagsController,
  getPostsController,
  sharePostToProfileController,
  votePostController,
  resolvePostByUserIdController,
  postActivityDistributionController,
  getTotalActivePostsController,
  getTotalPostsController,
  getPostsDataDistributionByYearController,
  getAllTotalDataInPostPageController,
  getDataDailyPostsTrendController,
  getDatePostsOverviewController,
  getAllPostsController,
  getPostActivitiesController,
} from '../controllers/post.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isAdmin, isAll, isUser } from '../middlewares/verify_roles';

const router = Router();

router.get('/all', verifyAccessToken, isAdmin, getAllPostsController);
// ----------------------------------------------------------ADMIN----------------------------------------------------------------------
router.get('/activity/distribute', verifyAccessToken, isAdmin, postActivityDistributionController);
router.get('/total/active', verifyAccessToken, isAdmin, getTotalActivePostsController);
router.get('/total/all', verifyAccessToken, isAll, getTotalPostsController);
router.get(
  '/year/distribution',
  verifyAccessToken,
  isAll,
  getPostsDataDistributionByYearController,
);
router.get('/data/page', verifyAccessToken, isAdmin, getAllTotalDataInPostPageController);
router.get('/chart/trend', verifyAccessToken, isAdmin, getDataDailyPostsTrendController);
router.get('/overview', verifyAccessToken, isAdmin, getDatePostsOverviewController);

// ----------------------------------------------------------USER----------------------------------------------------------------------
router.post('', verifyAccessToken, isUser, createPostController);
router.get('/category/:categoryId', getPostsWithCategoryIdAndTagsController);
router.get('/:_id', getPostByIdController);
// router.put('', verifyAccessToken, isUser, editPostByIdController);
router.post('/vote/:_id', verifyAccessToken, isUser, votePostController);
// router.get('/search/:categoryId', searchPostWithCategoryIdController);
router.delete('/:postId', verifyAccessToken, deletePostByIdController);
router.post('/share/:postId', verifyAccessToken, isUser, sharePostToProfileController);
router.get('/user/:postedBy', verifyAccessToken, isUser, getPostsByUserIdController);
router.get('', verifyAccessToken, isUser, getPostsController);
router.post('/resolve/:_id', verifyAccessToken, isUser, resolvePostByUserIdController);
router.get('/post-activities/:userId', verifyAccessToken, getPostActivitiesController);

export default router;
