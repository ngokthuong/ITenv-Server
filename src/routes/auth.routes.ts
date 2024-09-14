import Router from 'express'
import { createAndSendOtp, loginController, githubOauthController, verifyOtp, refreshAccessToken } from '../controllers/auth.controller'
import { verifyAccessToken } from '../middleware/verifyToken.mdw'

const router = Router();

router.post('/register', createAndSendOtp);
router.post('/verify-signup', verifyOtp);
router.post('/login', loginController);
router.post('/refresh-accessToken', refreshAccessToken);


export default router