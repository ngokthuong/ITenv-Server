import { getNotificationByUserIdService } from '../services/notification.service';
import { AuthRequest } from '../types/AuthRequest.type';
import asyncHandler from 'express-async-handler';
import { ResponseType } from '../types/Response.type';

export const getNotificationByUserIdController = asyncHandler(async (req: AuthRequest, res: any) => {
    try {
        const postedBy = req.user?.userId;
        const page = parseInt(req.query.page as string || '1');
        const pageSize = parseInt(req.query.pageSize as string || '10');
        const result = await getNotificationByUserIdService(postedBy as string, page, pageSize);
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
