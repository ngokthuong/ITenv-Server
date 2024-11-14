import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import { ResponseType } from '../types/Response.type';
import {
  acceptFriendRequestService,
  blockFriendRequestService,
  createFriendRequest,
  getFriendRequestByUserIdService,
  getFriendsByUserIdService,
  rejectFriendRequestService,
} from '../services/friend.service';

export const createFriendRequestConrtroller = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const sendBy = req.user?.userId;
    const { receiver } = req.body;
    const result = await createFriendRequest({ sendBy, receiver });
    const response: ResponseType<typeof result> = {
      success: true,
      data: result,
    };
    return res.status(201).json(response);
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
    const userId = req.user?.userId;
    const { friendId } = req.body;
    const acceptFriend = acceptFriendRequestService(friendId, userId as string);
    const response: ResponseType<typeof acceptFriend> = {
      success: true,
      data: acceptFriend,
      message: 'Accpeted friend request',
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

export const rejectFriendRequestController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.userId;
    const { friendId } = req.body;
    const acceptFriend = rejectFriendRequestService(friendId, userId as string);
    const response: ResponseType<typeof acceptFriend> = {
      success: true,
      data: acceptFriend,
      message: 'Rejected friend request',
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

export const blockFriendController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const blockBy = req.user?.userId;
    const { friendId } = req.body;
    const acceptFriend = blockFriendRequestService(friendId, blockBy as string);
    const response: ResponseType<typeof acceptFriend> = {
      success: true,
      data: acceptFriend,
      message: 'Rejected friend request',
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

export const getFriendsByUserIdController = asyncHandler(async (req: any, res: any) => {
  try {
    const userId = req.params.userId;
    const { friends, total } = await getFriendsByUserIdService(userId);
    const response: ResponseType<typeof friends> = {
      success: true,
      data: friends,
      total: total,
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      error: error.message,
    };
    return res.status(500).json(response);
  }
});

export const getFriendRequestByUserIdController = asyncHandler(
  async (req: AuthRequest, res: any) => {
    try {
      const queryOption = req.query;
      const receiver = req.user?.userId;
      const { result, total } = await getFriendRequestByUserIdService(
        receiver as string,
        queryOption,
      );
      const response: ResponseType<typeof result> = {
        success: true,
        total: total,
        data: result,
      };
      return res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseType<null> = {
        success: false,
        error: error.message,
      };
      return res.status(500).json(response);
    }
  },
);
