import Router from 'express';
import { getNotificationByUserIdController } from '../controllers/notification.controller';
import { isUser } from '../middlewares/verify_roles';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
const router = Router();

router.get('/all-notification', verifyAccessToken, isUser, getNotificationByUserIdController);

export default router;