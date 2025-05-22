import { Router } from 'express';
import { refactorCode } from '../controllers/ai.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isUser } from '../middlewares/verify_roles';

const router = Router();

router.post('/refactor', verifyAccessToken, isUser, refactorCode);

export default router;
