import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import { ResponseType } from '../types/Response.type';
import { checkListFriendService, createGroupChatService, editConversationNameService, getConversationsOfUserByUserIdService } from '../services/conversation.service';

export const getConversationsOfUserByUserIdController = asyncHandler(async (req: AuthRequest, res: any) => {
    try {
        const userId = req.user?.userId;
        const queryOption = req.query
        const result = await getConversationsOfUserByUserIdService(userId as string, queryOption);
        const response: ResponseType<typeof result> = {
            success: true,
            data: result,
        };
        return res.status(200).json(response);

    } catch (error: any) {
        const response: ResponseType<null> = {
            success: false,
            message: error.message
        }
        return res.status(400).json(response)
    }
});


// click avatar -> if ( conversation null => create conversation ) then {open conversation}
export const createGroupChatController = asyncHandler(async (req: AuthRequest, res: any) => {
    try {
        const createBy = req.user?.userId;
        let { participants, groupName } = req.body;
        participants = Array.isArray(participants) ? participants : [participants];
        const result = await createGroupChatService(createBy as string, participants, groupName);
        const response: ResponseType<typeof result> = {
            success: true,
            data: result,
        };
        return res.status(200).json(response);

    } catch (error: any) {
        const response: ResponseType<null> = {
            success: false,
            message: error.message
        }
        return res.status(400).json(response)
    }
});

// ( user id )
export const editConversationNameController = asyncHandler(async (req: AuthRequest, res: any) => {
    try {
        const createBy = req.user?.userId;
        const { groupName, conversationId } = req.body;
        const result = await editConversationNameService(createBy as string, conversationId, groupName)
        const response: ResponseType<typeof result> = {
            success: true,
            data: result,
        };
        return res.status(200).json(response);
    } catch (error: any) {
        const response: ResponseType<null> = {
            success: false,
            message: error.message
        }
        return res.status(400).json(response)
    }
});

// add user to conversation 
export const addUserToConversationController = asyncHandler(async (req: AuthRequest, res: any) => {
    try {
        const userId = req.user?.userId;
        const { listFriendId } = req.body;


    } catch (error: any) {

    }
});

// delete user in conversation 
export const deleteUserInConversationController = asyncHandler(async (req: AuthRequest, res: any) => {
    try {
        const userId = req.user?.userId;
        const { listFriendId } = req.body;


    } catch (error: any) {

    }
});

// delete conversation 
export const deleteConversationController = asyncHandler(async (req: AuthRequest, res: any) => {
    try {
        const userId = req.user?.userId;
        const { listFriendId } = req.body;


    } catch (error: any) {

    }
});