import { Router } from 'express';
import {
  acceptFriendRequestController,
  createFriendRequestConrtroller,
  rejectFriendRequestController,
  getFriendRequestByUserIdController,
  getFriendsByUserIdController,
  getFriendsOutsiteGroupChatController,
} from '../controllers/friend.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isUser } from '../middlewares/verify_roles';

const router = Router();

router.post('', verifyAccessToken, isUser, createFriendRequestConrtroller);
router.post('/accept', verifyAccessToken, isUser, acceptFriendRequestController);
router.post('/reject', verifyAccessToken, isUser, rejectFriendRequestController);

router.get('/request', verifyAccessToken, isUser, getFriendRequestByUserIdController);
router.get(
  '/outsiteGroup/:conversationId',
  verifyAccessToken,
  isUser,
  getFriendsOutsiteGroupChatController,
);
router.get('/:userId', verifyAccessToken, isUser, getFriendsByUserIdController);

export default router;
