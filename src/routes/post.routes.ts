import Router from 'express';
import { createPostController, getAllPostsController } from '../controllers/post.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';

const router = Router();

router.post('/create-post', verifyAccessToken, createPostController);
router.get('/all-pots', getAllPostsController);


export default router;
