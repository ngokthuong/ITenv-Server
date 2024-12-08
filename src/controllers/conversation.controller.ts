import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import { ResponseType } from '../types/Response.type';
import {
  addMemberService,
  changeImageGroupChatService,
  checkListFriendService,
  createGroupChatService,
  editConversationNameService,
  getConversationsOfUserByUserIdService,
  leaveGroupChatService,
  removeMemberService,
  setMemberAsAdminService,
} from '../services/conversation.service';

export const getConversationsOfUserByUserIdController = asyncHandler(
  async (req: AuthRequest, res: any) => {
    try {
      const userId = req.user?.userId;
      const queryOption = req.query;
      const { result, totalCount } = await getConversationsOfUserByUserIdService(
        userId as string,
        queryOption,
      );
      const response: ResponseType<typeof result> = {
        success: true,
        data: result,
        total: totalCount,
      };
      return res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseType<null> = {
        success: false,
        message: error.message,
      };
      return res.status(500).json(response);
    }
  },
);

// click avatar -> if ( conversation null => create conversation ) then {open conversation}
export const createGroupChatController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const createdBy = req.user?.userId;
    let { participants, groupName } = req.body;
    participants = Array.isArray(participants) ? participants : [participants];
    const result = await createGroupChatService(createdBy as string, participants, groupName);
    const response: ResponseType<typeof result> = {
      success: true,
      data: result,
    };
    return res.status(201).json(response);
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      message: error.message,
    };
    return res.status(500).json(response);
  }
});
export const removeMemberControllers = asyncHandler(async (req: AuthRequest, res: any) => {
  const adminId = req.user?.userId;
  const { userId } = req.body;
  const { conversationId } = req.params;

  if (!adminId || !userId || !conversationId) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }
  try {
    const updatedConversation = await removeMemberService(userId, conversationId, adminId);

    res.status(200).json({
      success: true,
      data: updatedConversation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const addMemberController = asyncHandler(async (req: AuthRequest, res: any) => {
  const { memberIds } = req.body;
  const { conversationId } = req.params;
  const addBy = req.user?.userId;
  try {
    const result = await addMemberService(memberIds, conversationId, addBy as string);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
export const leaveGroupController = asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user?.userId;
  const { conversationId } = req.params;
  try {
    const result = await leaveGroupChatService(userId as string, conversationId);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export const setMemberAsAdminController = asyncHandler(async (req: AuthRequest, res: any) => {
  const adminId = req.user?.userId;
  const { userId } = req.body;
  const { conversationId } = req.params;
  try {
    const response = await setMemberAsAdminService(adminId!, conversationId, userId);
    return res.status(200).json({ success: true, data: response });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
// ( user id )
export const editConversationNameController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const createBy = req.user?.userId;
    const { conversationId } = req.params;
    const { groupName } = req.body;
    if (!createBy || !conversationId || !groupName) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    const result = await editConversationNameService(createBy as string, conversationId, groupName);
    const response: ResponseType<typeof result> = {
      success: true,
      data: result,
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      message: error.message,
    };
    return res.status(500).json(response);
  }
});

export const changeGroupPhotoController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const filePath = req.file?.path;
    const createBy = req.user?.userId;
    const { conversationId } = req.params;
    if (!createBy || !conversationId || !filePath) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    const result = await changeImageGroupChatService(createBy as string, conversationId, filePath);
    const response: ResponseType<typeof result> = {
      success: true,
      data: result,
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      message: error.message,
    };
    return res.status(500).json(response);
  }
});

// add user to conversation
export const addUserToConversationController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.userId;
  } catch (error: any) {}
});

// delete user in conversation
export const deleteUserInConversationController = asyncHandler(
  async (req: AuthRequest, res: any) => {
    try {
      const userId = req.user?.userId;
      const { listFriendId } = req.body;
    } catch (error: any) {}
  },
);

// delete conversation
export const deleteConversationController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.userId;
    const { listFriendId } = req.body;
  } catch (error: any) {}
});
