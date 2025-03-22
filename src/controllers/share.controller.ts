import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import { ResponseType } from '../types/Response.type';
import { deletePostSharedService } from '../services/share.service';

export const deletePostSharedByIdController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const shareId = req.params._id;
    const deleted = await deletePostSharedService(shareId);
    const response: ResponseType<typeof deleted> = {
      success: true,
      data: deleted,
      message: 'Delete a share post is successfully',
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
