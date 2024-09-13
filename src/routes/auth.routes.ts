import Router from 'express'
import { createAndSendOtp, loginController, githubOauthController, verifyOtp } from '../controllers/auth.controller'
import { verifyAccessToken } from '../middleware/verifyToken.mdw'

const router = Router();

router.post('/register', createAndSendOtp);
router.post('/verify-signup', verifyOtp);
router.post('/login', loginController);
// router.get('/current', verifyAccessToken, getOneAccountDetail);
router.post('/github-oauth', githubOauthController);

export default router