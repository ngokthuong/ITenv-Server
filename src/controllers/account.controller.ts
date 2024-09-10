import { response } from "express";
import asyncHandeler from "express-async-handler";
import { registerService, loginService } from '../services/index.services';
import { Request, Response } from 'express';
import schema from "../helper/joiSchema.helper";
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
        const { accessToken, accountData } = await loginService(email, password);
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
