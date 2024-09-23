import Router from 'express'
import { createAndSendOtp, loginController, githubOauthController, verifyOtp, refreshAccessToken, logoutController, forgotPassController, resetPassController } from '../controllers/auth.controller'
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
router.get('/forgot-pass', forgotPassController);
router.post('/reset-pass', resetPassController);



export default router