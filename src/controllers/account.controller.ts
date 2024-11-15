import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import { ResponseType } from '../types/Response.type';
import { getAllAccountByUserIdService } from '../services/account.service';

export const getAllAccountByUserIdController = asyncHandler(async (req: AuthRequest, res: any) => {
    const userId = req.user?.userId;
    const result = await getAllAccountByUserIdService(userId as string);
    const response: ResponseType<typeof result> = {
        success: true,
        data: result
    }
    return res.status(200).json(response);
})

    