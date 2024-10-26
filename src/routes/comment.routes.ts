import { Router } from 'express';
import {
  getCommentsByPostIdController,
  postCommentController,
  voteCommentController,
} from '../controllers/comment.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';

const router = Router();

router.get('/:postId', getCommentsByPostIdController);

router.post('/:postId', verifyAccessToken, postCommentController);
router.post('/vote/:_id', verifyAccessToken, voteCommentController);

export default router;
