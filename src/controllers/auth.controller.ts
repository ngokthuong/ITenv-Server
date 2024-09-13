import asyncHandler from "express-async-handler";
import { verifyAndRegisterService, loginService, exchangeGithubCodeForToken, fetchGithubUserData, fetchGithubUserEmail, checkAccountExisted } from '../services/index.services';
import { NextFunction, Request, Response } from 'express';
import schema from "../helper/joiSchema.helper";
import { generateAndSendOTP, verifyOTP } from "../services/otp.service"

// use express-async-handler
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
            success: true,
            resultOtp: resultOtp
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


// LOGIN ( missing isblocked )

export const loginController = asyncHandler(async (req: any, res: any) => {
    try {
        const { accessToken, refreshToken, dataResponse } = await loginService(req.body);
        // save refreshToken in cookie 
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 1000 })
        return res.status(200).json({
            success: true,
            accessToken,
            dataResponse
        });
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
});

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