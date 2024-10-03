import Router from 'express';
import { verifyAccessToken } from '../middleware/verifyToken.mdw';
import { getAllUser, getCurrentUser } from '../controllers/user.controller';

const router = Router();

router.get('/current', verifyAccessToken, getCurrentUser);
router.get('/all', getAllUser);

export default router;
