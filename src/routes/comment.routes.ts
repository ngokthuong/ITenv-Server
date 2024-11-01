import { Router } from 'express';
import {
  deleteCommentController,
  editCommentByIdController,
  getCommentsByPostIdController,
  postCommentController,
  voteCommentController,
} from '../controllers/comment.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isUser } from '../middlewares/verify_roles';

const router = Router();

router.get('/:postId', getCommentsByPostIdController);

router.post('/:postId', verifyAccessToken, postCommentController);
router.post('/vote/:_id', verifyAccessToken, voteCommentController);
router.put('/edit/:_id', verifyAccessToken, isUser, editCommentByIdController);
router.post('/delete/:_id', verifyAccessToken, isUser, deleteCommentController);

export default router;
