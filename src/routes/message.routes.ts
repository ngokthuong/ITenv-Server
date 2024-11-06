import Router from 'express';
import { isUser } from '../middlewares/verify_roles';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { addMessForConversationByUserIdController, getAllMesssOfCvssByCvssIdController, recalledMessageBySenderController } from '../controllers/message.controller';
import uploader from '../config/cloudinary';

const router = Router();

router.post('/post-mess', verifyAccessToken, isUser, uploader.single('image'), addMessForConversationByUserIdController);
router.get('/get-mess/:conversationId', verifyAccessToken, isUser, getAllMesssOfCvssByCvssIdController);
router.post('/recall-mess/:conversationId', verifyAccessToken, isUser, recalledMessageBySenderController);

export default router;