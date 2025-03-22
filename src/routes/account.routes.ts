import Router from 'express';
import {
  createAndSendOtp,
  loginController,
  githubOauthController,
  verifyAndRegisterController,
  refreshAccessToken,
  logoutController,
  forgotPassController,
  resetPassController,
  googleOauthController,
  verifyOtpController,
} from '../controllers/auth.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { ApiAuth } from '../enums/apiAuth.enum';
import { isAdmin, isUser } from '../middlewares/verify_roles';
import {
  editRoleUserInAccountController,
  getAllAccountAndUserController,
  getAllAccountByUserIdController,
} from '../controllers/account.controller';

const router = Router();

// RESET PASS
router.post(ApiAuth.FORGOT_PASS, forgotPassController);
router.post(ApiAuth.VERIFY_OTP, verifyOtpController);
router.post(ApiAuth.RESET_PASS, resetPassController);

// REGISTER & LOGIN & LOGOUT
router.post(ApiAuth.REGISTER, createAndSendOtp);
router.post(ApiAuth.VERIFY_SIGNUP, verifyAndRegisterController);
router.post(ApiAuth.LOGIN, loginController);
router.post(ApiAuth.GITHUB_OAUTH, githubOauthController);
router.post(ApiAuth.GOOGLE_OAUTH, googleOauthController);
router.post(ApiAuth.FACEBOOK_OAUTH);
router.post(ApiAuth.LOGOUT, verifyAccessToken, logoutController);
router.put(ApiAuth.EDIT_ROLE_USER, verifyAccessToken, isAdmin, editRoleUserInAccountController);

// REFRESH TOKEN
router.post(ApiAuth.REFRESH_ACCESS_TOKEN, refreshAccessToken);

// ACCOUNT update
router.get(ApiAuth.GET_ALL_ACCOUNT, verifyAccessToken, isUser, getAllAccountByUserIdController);
// ADMIN
router.get(
  ApiAuth.GET_ALL_ACCOUNT_USER,
  verifyAccessToken,
  isAdmin,
  getAllAccountAndUserController,
);

export default router;
