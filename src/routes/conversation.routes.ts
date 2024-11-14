
import { Router } from "express";
import { verifyAccessToken } from "../middlewares/verifyToken.mdw";
import { isUser } from "../middlewares/verify_roles";
import { createGroupChatController, getConversationsOfUserByUserIdController } from "../controllers/conversation.controller";

const router = Router();

router.get('', verifyAccessToken, isUser, getConversationsOfUserByUserIdController);
router.post('', verifyAccessToken, isUser, createGroupChatController);


export default router;
