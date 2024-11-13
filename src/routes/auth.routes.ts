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
import { isUser } from '../middlewares/verify_roles';
import { getAllAccountByUserIdController } from '../controllers/account.controller';

const router = Router();

// RESET PASS
router.get(ApiAuth.FORGOT_PASS, forgotPassController);
router.get(ApiAuth.VERIFY_OTP, verifyOtpController);
router.post(ApiAuth.RESET_PASS, resetPassController);

// REGISTER & LOGIN & LOGOUT
router.post(ApiAuth.REGISTER, createAndSendOtp);
router.post(ApiAuth.VERIFY_SIGNUP, verifyAndRegisterController);
router.post(ApiAuth.LOGIN, loginController);
router.post(ApiAuth.GITHUB_OAUTH, githubOauthController);
router.post(ApiAuth.GOOGLE_OAUTH, googleOauthController);
router.post(ApiAuth.FACEBOOK_OAUTH,);
router.post(ApiAuth.LOGOUT, verifyAccessToken, logoutController);

// REFRESH TOKEN
router.post(ApiAuth.REFRESH_ACCESS_TOKEN, refreshAccessToken);


// ACCOUNT update
router.get(ApiAuth.GET_ALL_ACCOUNT, verifyAccessToken, isUser, getAllAccountByUserIdController);

export default router;
