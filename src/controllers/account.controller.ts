import { response } from "express";
import asyncHandeler from "express-async-handler";
import { registerService } from '../services/index.services';
import joi from "joi";
import { email, firstName, lastName, authenWith } from '../helper/joiSchema.helper';
// use express-async-handler


export const registerController = asyncHandeler(async (req: any, resp: any) => {
    const { error } = joi.object({ email, firstName, lastName, authenWith }).validate(req.body)
    if (error)
        return resp.status(400).json({
            sucess: false,
            mes: "Missing inputs in signup"
        })
    if (req.authenWith === 0) {
        if (req.password !== req.confirmPassword)
            return resp.status(400).json({
                sucess: false,
                mes: "Passwords do not match"
            })
    }
    const respond = await registerService(req.body)
    return resp.status(200).json({
        sucess: respond ? true : false,
        response: respond
    })
})

