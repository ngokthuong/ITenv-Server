import { response } from "express";
import asyncHandeler from "express-async-handler";
import { registerService } from '../services/index.services';
import joi, { any } from "joi";
import { Request, Response } from 'express';
import schema from "../helper/joiSchema.helper";
import Account from "../model/account";
import mongoose from "mongoose";
import User from "../model/user";
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
    const account = await Account.findOne({ email: req.body.email })
    // Check in the database to see if this email has already been registered.
    if (account) {
        // throw run sample return
        if (req.body.authenWith === 0 && account.authenWith === 0 || req.body.authenWith === 1 && account.authenWith === 1 || req.body.authenWith === 2 && account.authenWith === 2 || req.body.authenWith === 3 && account.authenWith === 3) {
            throw new Error('Account has existet')
        } else {

        }
    } else {
        const newAccount = await registerService(req.body)
        // vua tao vua hash
        return resp.status(200).json({
            sucess: newAccount ? true : false,
            response: newAccount ? 'Register is successfully. Please login with email and password' : 'Something went wrong'
        })
        // Bắt đầu một phiên làm việc (session) để sử dụng giao dịch

    }



})



export const loginController = asyncHandeler(async (req: any, resp: any) => {
    // Xác thực dữ liệu từ req.body với schema
    const { email, password } = req.body;
    if (!email || !password) {
        return resp.status(400).json({
            sucess: false,
            mes: "Missing inputs in login"
        })
    }
    // nếu như dùng cá phương thức truy vấn trong mongo thì giá trị trả về sẽ là 1 instant của mongo => instant đó có thể truy cập được đến schema trong mongo
    // plain object 
    const account = await Account.findOne({ email: req.body.email })
    if (account && await account.isCorrectPassword(password)) {

        // refresh token

        // convert instant obj in plain obj use to toObject function 
        const { password, role, ...userData } = account.toObject()
        return resp.status(200).json({
            success: true,
            userData
        })
    } else {
        throw new Error('Invalid credentials!')
    }


})

