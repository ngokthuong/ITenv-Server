import { Router } from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isUser } from '../middlewares/verify_roles';
import {
  addMemberController,
  changeGroupPhotoController,
  createGroupChatController,
  editConversationNameController,
  getConversationsOfUserByUserIdController,
  leaveGroupController,
  removeMemberControllers,
  setMemberAsAdminController,
} from '../controllers/conversation.controller';
import { getMyConversationWithUserController } from '../controllers/message.controller';
import uploadCloud from '../config/cloudinary';

const router = Router();

router.get('', verifyAccessToken, isUser, getConversationsOfUserByUserIdController);
router.post('', verifyAccessToken, isUser, createGroupChatController);
router.put(
  '/change-name/:conversationId',
  verifyAccessToken,
  isUser,
  editConversationNameController,
);

router.put(
  '/change-photo/:conversationId',
  verifyAccessToken,
  isUser,
  uploadCloud.single('image'),
  changeGroupPhotoController,
);

router.post('/add-member/:conversationId', verifyAccessToken, isUser, addMemberController);
router.post('/remove-member/:conversationId', verifyAccessToken, isUser, removeMemberControllers);
router.put('/leave/:conversationId', verifyAccessToken, isUser, leaveGroupController);
router.put('/set-admin/:conversationId', verifyAccessToken, isUser, setMemberAsAdminController);
router.get(
  '/getMyConversationWithUser/:userId',
  verifyAccessToken,
  isUser,
  getMyConversationWithUserController,
);

export default router;
