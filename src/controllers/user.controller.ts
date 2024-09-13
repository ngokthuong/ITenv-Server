import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { any, string } from 'joi';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import Account from '../models/account';


const refreshAccessToken = asyncHandler(async (req: any, res: any) => {
    // get token in cookie 
    const cookie = await req.cookies
    // check token is null
    if (!cookie && !cookie.refreshToken) {
        // return {
        //     success: false,
        //     message: 'No refresh in cookie'
        // }
        throw new Error('No refresh in cookie')
    }
    // check token is true
    jwt.verify(cookie.refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN as string, async (err: any, decode: any) => {
        if (err)
            throw new Error('Invalid refresh token')
        // compare token with token in data 
        const response = await Account.findOne({
            _id: decode._id,
            refreswhToken: cookie.refreshToken
        });

    })
})