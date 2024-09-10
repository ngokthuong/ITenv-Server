import Router from 'express'
import { registerController, loginController } from '../controllers/account.controller'
import { verifyAccessToken } from '../middleware/verifyToken.mdw'

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
// router.get('/current', verifyAccessToken, getOneAccountDetail);

export default router