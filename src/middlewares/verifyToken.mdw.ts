import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
export interface CustomJwtPayload extends JwtPayload {
  _accId: string;
  role: string;
  userId: string;
}
interface AuthRequest extends Request {
  user?: CustomJwtPayload;
}

export const verifyAccessToken = asyncHandler(
  async (req: AuthRequest, res: any, next: NextFunction) => {
    if (req?.headers?.authorization?.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      // check token
      jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decode: any) => {
        // decode: chứa payload của token. Payload thường chứa thông tin như user ID, role, hoặc bất kỳ thông tin nào bạn lưu trữ khi tạo token.
        if (err)
          return res.status(401).json({
            success: false,
            message: 'Invalid accessToken',
            // message: err.message,
          });
        req.user = decode as CustomJwtPayload;
        next();
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Require authentication!',
      });
    }
  },
);
