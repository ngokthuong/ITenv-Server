import Router from 'express';
import {
  createAndSendOtp,
  loginController,
  githubOauthController,
  verifyOtp,
  refreshAccessToken,
  logoutController,
  forgotPassController,
  resetPassController,
  googleOauthController,
} from '../controllers/auth.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { ApiAuth } from '../enums/apiAuth.enum';

const router = Router();

router.post(ApiAuth.REGISTER, createAndSendOtp);
router.post(ApiAuth.VERIFY_SIGNUP, verifyOtp);
router.post(ApiAuth.LOGIN, loginController);
router.post(ApiAuth.GITHUB_OAUTH, githubOauthController);
router.post(ApiAuth.GOOGLE_OAUTH, googleOauthController);
router.post(ApiAuth.FACEBOOK_OAUTH,);
router.post(ApiAuth.REFRESH_ACCESS_TOKEN, refreshAccessToken);
router.post(ApiAuth.LOGOUT, verifyAccessToken, logoutController);
router.post(ApiAuth.FORGOT_PASS, forgotPassController);
router.post(ApiAuth.RESET_PASS, resetPassController);

export default router;
