import Router from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { getAllUser, getCurrentUser } from '../controllers/user.controller';
import { ApiUsers } from '../enums/apiUser.enum';
const router = Router();

router.get(ApiUsers.CURRENT_USER, verifyAccessToken, getCurrentUser);
router.get(ApiUsers.ALL_USERS, getAllUser);

export default router;
