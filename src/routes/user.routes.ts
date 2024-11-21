import Router from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import {
  editAvatarByUserIdController,
  editProfileByUserIdController,
  getAllFriendsOfUserByTypeController,
  getAllUserController,
  getAllUserForAdminController,
  getChurnUserRateController,
  getCurrentUser,
  getDetailUserByIdController,
  getNewUsersByMonthController,
  getNewUsersTodayController,
  getTotalActiveUserController,
  getTotalUserController,
  getUserByIdController,
  getUserGrowthController,
  getUsersForFriendPageController,
  userDemographicsController,
} from '../controllers/user.controller';
import { ApiUsers } from '../enums/apiUser.enum';
import { isAdmin, isAll, isUser } from '../middlewares/verify_roles';
import uploadCloud from '../config/cloudinary';
import { getTopProblemSolversController } from '../controllers/problem.controller';
const router = Router();


//------------------------------------------------------------ADMIN-------------------------------------------------------------------
router.get(ApiUsers.NEW_USER_BY_MONTH, verifyAccessToken, isAdmin, getNewUsersByMonthController);
router.get(ApiUsers.NEW_USER_TODAY, verifyAccessToken, isAdmin, getNewUsersTodayController);
router.get(ApiUsers.TOTAL_USER, verifyAccessToken, isAdmin, getTotalUserController);
router.get(ApiUsers.TOTAL_ACTIVE, verifyAccessToken, isAdmin, getTotalActiveUserController);
router.get(ApiUsers.CHURN_USER_RATE, verifyAccessToken, isAdmin, getChurnUserRateController);
router.get(ApiUsers.USER_GROWTH, verifyAccessToken, isAdmin, getUserGrowthController)
router.get(ApiUsers.USER_DEMOGRAPHICS, verifyAccessToken, isAdmin, userDemographicsController)

// ---------------------------------------------------------USER-----------------------------------------------------------------------
router.get(ApiUsers.USER_DETAIL, verifyAccessToken, isUser, getDetailUserByIdController);
router.get(ApiUsers.CURRENT_USER, verifyAccessToken, isAll, getCurrentUser);
router.get(ApiUsers.ALL_USERS, getAllUserController);
router.get(ApiUsers.ALL_FRIENDS, verifyAccessToken, isUser, getAllFriendsOfUserByTypeController);
router.get(ApiUsers.ALL_USERS_FRIENDPAGE, verifyAccessToken, isUser, getUsersForFriendPageController);
router.get(ApiUsers.SINGLE_USER_BY_ID, verifyAccessToken, isUser, getUserByIdController);
router.put(ApiUsers.EDIT_MYPROFILE, verifyAccessToken, isUser, editProfileByUserIdController);
router.put(ApiUsers.EDIT_AVATAR, verifyAccessToken, isUser, uploadCloud.single('image'), editAvatarByUserIdController);


export default router;
