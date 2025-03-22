import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import { ResponseType } from '../types/Response.type';
import {
  editRoleUserInAccountService,
  getAllAccountAndUserService,
  getAllAccountByUserIdService,
} from '../services/account.service';

export const getAllAccountByUserIdController = asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user?.userId;
  const result = await getAllAccountByUserIdService(userId as string);
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});

// -------------------------------------------------------------ADMIN-------------------------------------------------------------------

export const getAllAccountAndUserController = asyncHandler(async (req: AuthRequest, res: any) => {
  const queryOption = req.query;
  const { data, total } = await getAllAccountAndUserService(queryOption);
  const response: ResponseType<typeof data> = {
    success: true,
    data: data,
    total: total,
  };
  return res.status(200).json(response);
});

export const editRoleUserInAccountController = asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.params.userId;
  const { role } = req.body;
  const result = await editRoleUserInAccountService(userId as string, role);
  if (result) {
    const response: ResponseType<typeof result> = {
      success: true,
      data: result,
    };
    return res.status(200).json(response);
  } else return res.status(400).json({ success: false, message: 'User not found' });
});
