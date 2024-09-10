import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

export const verifyAccessToken = asyncHandler(async (req: any, res: any, next: NextFunction) => {
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        //tách bearer khỏi token
        // headers: {author: Bearer token}
        const token = req.headers.authorization.split(' ')[1]
        // check token 
        jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decode: any) => {
            // err: Loi
            // decode: chứa payload của token. Payload thường chứa thông tin như user ID, role, hoặc bất kỳ thông tin nào bạn lưu trữ khi tạo token.
            if (err) {
                // 401: Nhắc nhở client gửi tbao để server tạo token 
                return res.status(401).json({
                    success: false,
                    message: 'Invalid accessToken'
                })
                req.account = decode
                next()
            }
        })
    } else {
        return res.status(401).json({
            success: false,
            message: 'Require authentication!'
        })
    }
});