import { getNotificationByUserIdService, isSeenNotidicationService } from '../services/notification.service';
import { AuthRequest } from '../types/AuthRequest.type';
import asyncHandler from 'express-async-handler';
import { ResponseType } from '../types/Response.type';

export const getNotificationsByUserIdController = asyncHandler(
  async (req: AuthRequest, res: any) => {
    try {
      const userId = req.user?.userId;
      const page = parseInt((req.query.page as string) || '1', 10);
      const pageSize = parseInt((req.query.pageSize as string) || '10', 10);

      const { result, total } = await getNotificationByUserIdService(
        userId as string,
        page,
        pageSize,
      );
      console.log(result)
      if (result == null) {
        return res
          .status(404)
          .json({ success: false, data: null, error: 'Notifications not found.' });
      }

      const response: ResponseType<typeof result> = {
        success: true,
        data: result,
        total,
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
  },
);

export const isSeenNotidicationController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const { notificationId } = req.body
    const result = await isSeenNotidicationService(notificationId);
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
})