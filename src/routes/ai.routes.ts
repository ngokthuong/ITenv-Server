import { Router } from 'express';
import { refactorCode, reviewCode, generateStreamingResponse } from '../controllers/ai.controller';
import { verifyAccessToken } from '../middlewares/verifyToken.mdw';
import { isUser } from '../middlewares/verify_roles';

const router = Router();

router.post('/refactor', verifyAccessToken, isUser, refactorCode);
router.post('/review', verifyAccessToken, isUser, reviewCode);
router.post('/stream', verifyAccessToken, isUser, generateStreamingResponse);

export default router;
