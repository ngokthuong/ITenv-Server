import { Router } from 'express';
import {
  acceptFriendRequestController,
  createFriendRequestConrtroller,
  rejectFriendRequestController,
  getFriendRequestByUserIdController,
  getFriendsByUserIdController,
} from '../controllers/friend.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isUser } from '../middlewares/verify_roles';

const router = Router();

router.post('/create', verifyAccessToken, isUser, createFriendRequestConrtroller);
router.post('/accept', verifyAccessToken, isUser, acceptFriendRequestController);
router.post('/reject', verifyAccessToken, isUser, rejectFriendRequestController);

router.get('/request', verifyAccessToken, isUser, getFriendRequestByUserIdController);
router.get('/:userId', verifyAccessToken, isUser, getFriendsByUserIdController);




export default router;
