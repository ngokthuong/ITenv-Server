import { response } from "express";
import Account from "../model/account";


const registerService = async (req: any) => {

    // check xem đã có email này trong database chưa
    // Gửi OTP về email
    // JWT và refresh roken 
    // Băm mk và add vào database
    const account = await Account.create(req.body)
    return account
}
export { registerService }