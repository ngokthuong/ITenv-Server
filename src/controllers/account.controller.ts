import { response } from "express";
import asyncHandeler from "express-async-handler";
import { registerService } from '../services/index.services';
import joi from "joi";
import { Request, Response } from 'express';
import schema from "../helper/joiSchema.helper";
// use express-async-handler


export const registerController = asyncHandeler(async (req: any, resp: any) => {
    // Xác thực dữ liệu từ req.body với schema
    const { error } = schema.validate(req.body, { allowUnknown: true });
    if (error) {
        console.log(error)
        return resp.status(400).json({
            sucess: false,
            mes: "Missing inputs in signup"
        })
    }
    if (req.authenWith === 0) {
        if (req.password !== req.confirmPassword)
            return resp.status(400).json({
                sucess: false,
                mes: "Passwords do not match"
            })
    }
    // vua tao vua bam 
    const respond = await registerService(req.body)
    return resp.status(200).json({
        sucess: respond ? true : false,
        response: respond
    })
})

