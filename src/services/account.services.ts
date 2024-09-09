import Account from "../model/account";
import User from "../model/user";


const registerService = async (data: any) => {
    // check xem đã có email này trong database chưa
    // Gửi OTP về email
    // JWT và refresh roken 
    // Băm mk và add vào database
    const account = await Account.create(data)
    const user = await User.create({
        username: account.firstName + account.lastName,
        account: [account._id]  // Liên kết với tài khoản mới tạo
    })
    account.user = user._id
    await account.save();
    return account
}

const createAccountWithOldUserID = async (data: any) => {
    const accountExist = await Account.findOne({ email: data.email });
    data.user = accountExist?.user
    const newAccount = await Account.create(data);
    return newAccount;
}

export { registerService, createAccountWithOldUserID }