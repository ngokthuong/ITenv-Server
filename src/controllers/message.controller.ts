import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import {
  addMessForConvertationByUserIdService,
  getAllMesssOfCvssByCvssIdService,
  recalledMessageBySenderService,
  seenMessageByUserIdService,
} from '../services/message.service';
import { ResponseType } from '../types/Response.type';
import {
  createConversationForTwoPeopleByUserService,
  findConversationByIdService,
} from '../services/conversation.service';
import { FilesObject, UploadedFile } from '../types/UploadFileType.type';

// have pageable
export const getAllMesssOfCvssByCvssIdController = asyncHandler(
  async (req: AuthRequest, res: any) => {
    try {
      const conversationId = req.params.conversationId;
      const queryOption = req.query;
      const result = await getAllMesssOfCvssByCvssIdService(conversationId, queryOption);
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
  },
);

// create message
export const addMessForConversationByUserIdController = asyncHandler(
  async (req: AuthRequest, res: any) => {
    const files = req?.files as unknown as FilesObject;
    const fileUrl = files?.file?.map((file: UploadedFile) => file?.path);
    console.log(fileUrl);
    try {
      const sender = req.user?.userId as string;
      let { reciever, content, conversationId, hasFile, hasText, parentMessage } = req.body;
      console.log(reciever, content, conversationId, hasFile, hasText, parentMessage);
      const data = req.body;
      const result = await addMessForConvertationByUserIdService(data, sender, fileUrl);
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
  },
);

// delete mess
// recalled with both sides
export const recalledMessageBySenderController = asyncHandler(async (req: any, res: any) => {
  try {
    const sender = req.user?.userId;
    const { messId } = req.body;
    const result = await recalledMessageBySenderService(sender, messId);
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

export const seenMessageByUserIdController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.userId;
    const { messageId } = req.body;
    const result = await seenMessageByUserIdService(userId as string, messageId);
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
