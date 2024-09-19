import asyncHandler from "express-async-handler";
import { refreshAccessTokenService, verifyAndRegisterService, loginService, exchangeGithubCodeForToken, fetchGithubUserData, fetchGithubUserEmail, checkAccountExisted, logoutService } from '../services/index.services';
import { NextFunction, Request, Response } from 'express';
import schema from "../helper/joiSchemaRegister.helper";
import { generateAndSendOTP } from "../services/otp.service"
import message from "../models/message";
import account from "../models/account";
import { addRefreshTokenToCookie, clearRefreshTokenInCookie } from "../middleware/cookie.mdw";

interface RefreshTokenResult {
    success: boolean;
    newAccessToken: string;
    message: string;
}

// OTP
export const createAndSendOtp = asyncHandler(async (req: any, res: any) => {
    const { error } = schema.validate(req.body, { allowUnknown: true });
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid credentials in sign up!"
        });
    }
    // checkemail function 
    if (await checkAccountExisted(req.body.email)) {
        return res.status(409).json({
            success: false,
            message: 'This email is already in user!'
        })
    }
    // create and sent otp 
    try {
        const resultOtp = await generateAndSendOTP(req.body.email);
        return res.status(200).json({
            success: resultOtp.success,
            message: resultOtp.message
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Failed to generate or send OTP',
            error: error.message || 'Internal server error',
        });
    }
});

export const verifyOtp = asyncHandler(async (req: any, res: any) => {

    try {
        // verify and create account
        const result = await verifyAndRegisterService(req.body);
        return res.status(200).json({
            success: result.success,
            message: result.message
        });
    } catch (err: any) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
});


// LOGIN + CREATE TOKEN
export const loginController = asyncHandler(async (req: any, res: any) => {
    try {
        // const { accessToken, refreshToken, dataResponse } = await loginService(req.body);
        const resultLoginService = await loginService(req.body);

        // save refreshToken in cookie 
        if (resultLoginService?.refreshToken)
            addRefreshTokenToCookie(res, resultLoginService?.refreshToken);
        else {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate refresh token'
            });
        }
        return res.status(200).json({
            success: resultLoginService?.success,
            message: resultLoginService?.message,
            accessToken: resultLoginService?.accessToken,
            dataResponse: resultLoginService?.dataResponse
        });
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
});

// LOGIN GITHUB
export const githubOauthController = asyncHandler(async (req: Request, res: Response, next) => {
    const { code } = req.body;
    try {
        const accessToken = await exchangeGithubCodeForToken(code);
        const userData = await fetchGithubUserData(accessToken);
        const email = await fetchGithubUserEmail(accessToken);
        userData.email = email || userData.email;
        const dataResp = {
            email: userData.email,
            username: userData.name || userData.login,
            authenWith: 3,
        };
        req.body = dataResp;
        loginController(req, res, next);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// LOGOUT 
export const logoutController = asyncHandler(async (req: any, res: any) => {
    const cookie = req.cookies
    if (!cookie || !cookie.refreshToken)
        return res.status(400).json({
            success: false,
            message: 'No refresh Token in cookies'
        })
    const result = await logoutService(cookie.refreshToken);
    //    delete refresh token in cookie
    clearRefreshTokenInCookie(res);
    return res.status(200).json({
        success: (await result).success,
        message: (await result).message
    });
})


// CREATE NEW ACCESSTOKEN WITH REFRESH TOKEN 
export const refreshAccessToken = asyncHandler(async (req: any, res: any) => {
    // Get the token from cookies
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            message: 'No refresh token in cookie'
        });
    }
    try {
        const result = await refreshAccessTokenService(refreshToken);
        return res.status(200).json({
            success: await result?.success,
            message: await result?.message,
            newAccessToken: result?.newAccessToken
        }
        );
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: await (error as Error).message
        });
    }
});

// FORGOT PASSWORD -> CHANGE PASSWORK OF USER
const forgotPassController = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.query;
    if (!email)
        throw new Error('missing email')
    const acc = account.findOne({ email })
    if (!acc)
        throw new Error('user not found')

})