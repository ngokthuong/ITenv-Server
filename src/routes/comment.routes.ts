import { Router } from 'express';
import {
  getCommentByPostIdController,
  postCommentController,
} from '../controllers/comment.comtroller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';

const router = Router();

router.get('/:postId', getCommentByPostIdController);

router.post('/:postId', verifyAccessToken, postCommentController);
export default router;
