import createError from 'http-errors'
import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
    status?: number;
}

export const notFound = (req: Request, resp: Response, next: NextFunction): void => {
    // Gửi phản hồi lỗi 404 với thông báo
    const error = new Error(`Route ${req.originalUrl} is not found`)
    // sent to client 
    resp.status(404)
    next(error)
};
// main handler error
export const errHandler = (error: ErrorWithStatus, req: Request, resp: Response, next: NextFunction): void => {
    // Nếu lỗi có thuộc tính status, sử dụng giá trị đó và 200 => ko phải lỗi code mà là db hoặc...
    const statusCode = error.status === 200 ? 500 : resp.statusCode;

    // Gửi phản hồi lỗi
    resp.status(statusCode).json({
        status: 'error',
        message: error.message || 'Internal Server Error',
    });
};
// 400 error
export const badRequest = (err: string, respond: any) => {
    const error = createError.BadRequest(err);
    return respond.status(error.status).json({
        err: 1,
        mes: error.message
    });
}


// export const interalServerError = (req, resp) => {
//     const error = createError.InternalServerError()
//     return resp.status(error.status).json({
//         err: 1,
//         mes: error.message
//     })
// }

// export const notFound = (req, resp) => {
//     const error = createError.NotFound('This route is not defined')
//     return resp.status(error.status).json({
//         err: 1,
//         mes: error.message
//     })
// }

// export const notAuth = (err, resp, isExpire) => {
//     const error = createError.Unauthorized(err)
//     return resp.status(error.status).json({
//         // isExpire ( da het han ) thi tra ve loi 2 va nguoc lai
//         // 2 là lỗi chung liên quan đến việc hết hạn
//         // 1 Chỉ định những loại lỗi khác
//         err: isExpire ? 2 : 1,
//         mes: error.message
//     })
// }