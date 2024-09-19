import Router from 'express'
import { createAndSendOtp, loginController, githubOauthController, verifyOtp, refreshAccessToken, logoutController } from '../controllers/auth.controller'
import { verifyAccessToken } from '../middleware/verifyToken.mdw'

const router = Router();

router.post('/register', createAndSendOtp);
router.post('/verify-signup', verifyOtp);
router.post('/login', loginController);
router.post('/github-oauth', githubOauthController);
router.post('/google-oauth',);
router.post('/facebook-oauth',);
router.post('/refresh-accessToken', refreshAccessToken);
router.post('/logout', verifyAccessToken, logoutController);

export default router