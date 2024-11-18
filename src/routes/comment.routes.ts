import { Router } from 'express';
import {
  deleteCommentController,
  editCommentByIdController,
  getCommentsByPostIdController,
  postCommentController,
  resolveCommentInPostByUserIdController,
  voteCommentController,
} from '../controllers/comment.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isAll, isUser } from '../middlewares/verify_roles';

const router = Router();

router.get('/:postId', getCommentsByPostIdController);
router.post('/:postId', verifyAccessToken, isUser, postCommentController);
router.post('/vote/:_id', verifyAccessToken, isUser, voteCommentController);
router.put('/:_id', verifyAccessToken, isUser, editCommentByIdController);
router.delete('/:_id', verifyAccessToken, isUser, deleteCommentController);
router.post('/resolve/:_id', verifyAccessToken, isUser, resolveCommentInPostByUserIdController);

export default router;
