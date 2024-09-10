import { response } from "express";
import asyncHandeler from "express-async-handler";
import { registerService, loginService } from '../services/index.services';
import { Request, Response } from 'express';
import schema from "../helper/joiSchema.helper";
import User from "../model/user";
import Account from "../model/account";
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
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing inputs in login"
        });
    }
    try {
        const { accessToken, refreshToken, accountData } = await loginService(email, password);
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


// export const getOneAccountDetail = asyncHandeler(async (req: any, res: any) => {
//     const { _id } = req.account;
//     const account = await Account.findById(_id)
//     return res.status.json({
//         success: false,
//         rs: account ? account : "account notfound"
//     })
// });

export const githubOauthController = asyncHandeler(async (req: Request, res: Response) => {
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

        console.log('User Data:', userData);
        console.log('Email Data:', emailData);

        // Respond to the client with user data and emails
        res.status(200).json({ user: userData, emails: emailData });
    } catch (error) {
        console.error('Error exchanging token or fetching user data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});