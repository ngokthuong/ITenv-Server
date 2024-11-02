import Router from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { getAllFriendsOfUserByTypeController, getAllUser, getCurrentUser, getUsersForFriendPageController } from '../controllers/user.controller';
import { ApiUsers } from '../enums/apiUser.enum';
import { isUser } from '../middlewares/verify_roles';
const router = Router();

router.get(ApiUsers.CURRENT_USER, verifyAccessToken, getCurrentUser);
router.get(ApiUsers.ALL_USERS, getAllUser);
router.get(ApiUsers.ALL_FRIENDS, verifyAccessToken, isUser, getAllFriendsOfUserByTypeController);

router.get(ApiUsers.ALL_USERS_FRIENDPAGE, verifyAccessToken, isUser, getUsersForFriendPageController);

export default router;
