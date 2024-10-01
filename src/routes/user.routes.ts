import Router from 'express';
import { verifyAccessToken } from '../middleware/verifyToken.mdw';
import { getCurrentUser } from '../controllers/user.controller';

const router = Router();

router.get('/current', verifyAccessToken, getCurrentUser);

export default router;
