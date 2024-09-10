import { response } from "express";
import asyncHandeler from "express-async-handler";
import { registerService, loginService } from '../services/index.services';
import { Request, Response } from 'express';
import schema from "../helper/joiSchema.helper";
import axios from "axios";
// use express-async-handler

export const registerController = asyncHandeler(async (req: any, res: any) => {
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


export const loginController = asyncHandeler(async (req: any, res: any) => {
    try {
        console.log('loginController body')
        console.log(req.body)
        const { accessToken, refreshToken, accountData } = await loginService(req.body);
        // save refreshToken in cookie 
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 1000 })
        return res.status(200).json({
            success: true,
            accessToken,
            accountData
        });
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
});



export const githubOauthController = asyncHandeler(async (req: Request, res: Response, next) => {
    console.log('body github')
    const { code } = req.body;
    console.log(code);

    try {
        // Exchange the code for an access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
                client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
                code,
            },
            { headers: { Accept: 'application/json' } },
        );
        const { access_token } = tokenResponse.data;
        // Fetch user data
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const userData = await userResponse.json();

        const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const emailData = await emailResponse.json();
        console.log(emailData[0]);
        if (emailData[0].email) {
            userData.email = emailData[0].email;
        }
        userData.firstName = userData.login;
        userData.lastName = userData.login;
        userData.authenWith = 3;
        const account = {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            authenWith: userData.authenWith,
        };
        req.body = account;
        loginController(req, res, next);
        // res.status(200).json({ success: true, user: userData });
    } catch (error) {
        console.error('Error exchanging token or fetching user data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
