import Router from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import {
  editAvatarByUserIdController,
  editProfileByUserIdController,
  getAllFriendsOfUserByTypeController,
  getAllUserController,
  getAllUserForAdminController,
  getCurrentUser,
  getDetailUserByIdController,
  getUserByIdController,
  getUsersForFriendPageController,
} from '../controllers/user.controller';
import { ApiUsers } from '../enums/apiUser.enum';
import { isAdmin, isUser } from '../middlewares/verify_roles';
import uploadCloud from '../config/cloudinary';
const router = Router();

router.get(ApiUsers.CURRENT_USER, verifyAccessToken, getCurrentUser);
router.get(ApiUsers.ALL_USERS, getAllUserController);
router.get(ApiUsers.ALL_FRIENDS, verifyAccessToken, isUser, getAllFriendsOfUserByTypeController);
router.get(ApiUsers.ALL_USERS_FRIENDPAGE, verifyAccessToken, isUser, getUsersForFriendPageController);
router.get(ApiUsers.SINGLE_USER_BY_ID, getUserByIdController);
router.put(ApiUsers.EDIT_MYPROFILE, verifyAccessToken, isUser, editProfileByUserIdController);
router.put(ApiUsers.EDIT_AVATAR, verifyAccessToken, isUser, uploadCloud.single('image'), editAvatarByUserIdController);
router.get(ApiUsers.USER_DETAIL, verifyAccessToken, isUser, getDetailUserByIdController);


router.get("/all/for-admin", verifyAccessToken, isAdmin, getAllUserForAdminController);
export default router;
