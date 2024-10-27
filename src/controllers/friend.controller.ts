import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import { ResponseType } from '../types/Response.type';
import { acceptFriendRequestService, createFriendRequest } from '../services/friend.service';

export const createFriendRequestConrtroller = asyncHandler(async (req: AuthRequest, res: any) => {
    try {
        const sendBy = req.user?.userId;
        const { receiver } = req.body;
        const result = await createFriendRequest({ sendBy, receiver });
        const response: ResponseType<typeof result> = {
            success: true,
            data: result,
        };
        return res.status(200).json(response);

    } catch (error: any) {
        const response: ResponseType<null> = {
            success: false,
            data: null,
            error: error.message,
        };
        return res.status(500).json(response);
    }
});

export const acceptFriendRequestController = asyncHandler(async (req: AuthRequest, res: any) => {
    try {
        const { friendId } = req.body
        const acceptFriend = acceptFriendRequestService(friendId);
        const response: ResponseType<typeof acceptFriend> = {
            success: true,
            data: acceptFriend,
            message: "Accpeted friend request"
        };
        return res.status(200).json(response);
    } catch (error: any) {
        const response: ResponseType<null> = {
            success: false,
            data: null,
            error: error.message,
        };
        return res.status(500).json(response);
    }
});

