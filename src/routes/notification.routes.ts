import Router from 'express';
import {
  getNotificationsByUserIdController,
  isSeenNotidicationController,
} from '../controllers/notification.controller';
import { isUser } from '../middlewares/verify_roles';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
const router = Router();

router.get('', verifyAccessToken, isUser, getNotificationsByUserIdController);
router.post('/seen', verifyAccessToken, isUser, isSeenNotidicationController);

export default router;
