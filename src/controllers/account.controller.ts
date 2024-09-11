import asyncHandler from "express-async-handler";
import { registerService, loginService, exchangeGithubCodeForToken, fetchGithubUserData, fetchGithubUserEmail } from '../services/index.services';
import { Request, Response } from 'express';
import schema from "../helper/joiSchema.helper";
import axios from "axios";
// use express-async-handler

export const registerController = asyncHandler(async (req: any, res: any) => {
    const { error } = schema.validate(req.body, { allowUnknown: true });
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Missing inputs in signup"
        });
    }
    try {
        const result = await registerService(req.body);
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
            username: userData.name,
            authenWith: 3,
        };

        req.body = dataResp;
        loginController(req, res, next);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});