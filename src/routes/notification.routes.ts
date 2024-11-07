import Router from 'express';
import { getNotificationByUserIdController, isSeenNotidicationController } from '../controllers/notification.controller';
import { isUser } from '../middlewares/verify_roles';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
const router = Router();

router.get('/all-notification', verifyAccessToken, isUser, getNotificationByUserIdController);
router.post('/seen-notification', verifyAccessToken, isUser, isSeenNotidicationController);

export default router;