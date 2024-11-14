import Router from 'express';
import { isUser } from '../middlewares/verify_roles';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import {
  addMessForConversationByUserIdController,
  getAllMesssOfCvssByCvssIdController,
  recalledMessageBySenderController,
  seenMessageByUserIdController,
} from '../controllers/message.controller';
import uploader from '../config/cloudinary';

const router = Router();

router.post(
  '',
  verifyAccessToken,
  isUser,
  uploader.fields([{ name: 'file', maxCount: 10 }]),
  addMessForConversationByUserIdController,
);
router.get(
  '/:conversationId',
  verifyAccessToken,
  isUser,
  getAllMesssOfCvssByCvssIdController,
);
router.post(
  '/recall/:conversationId',
  verifyAccessToken,
  isUser,
  recalledMessageBySenderController,
);
router.post('/seen', verifyAccessToken, isUser, seenMessageByUserIdController);

export default router;
