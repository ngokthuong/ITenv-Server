import createError from 'http-errors'
import { Request, Response, NextFunction } from 'express';
import { logEvents } from '../helper/logEvents';

interface ErrorWithStatus extends Error {
    status?: number;
}

export const notFound = (req: Request, resp: Response, next: NextFunction): void => {
    const error = new Error(`Route ${req.originalUrl} is not found`)
    resp.status(404)
    next(error)
};

export const errHandler = (error: ErrorWithStatus, req: Request, resp: Response, next: NextFunction): void => {
    const statusCode = error.status === 200 ? 500 : resp.statusCode;
    logEvents(`errhandler: ${req.url} --- ${req.method} --- ${error.message}`);
    resp.status(statusCode).json({
        status: 'error',
        message: error.message || 'Internal Server Error',
    });
};
// 400 error
export const badRequest = (err: string, respond: any) => {
    const error = createError.BadRequest(err);
    logEvents(`badRequest: ${error.message}`);
    return respond.status(error.status).json({
        err: 1,
        mes: error.message
    });
}
