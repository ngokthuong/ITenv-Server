import Account from "../model/account";
import User from "../model/user";
import { generateAccessToken, generateRefreshToken } from '../middleware/jwt.mdw'


const registerService = async (body: any) => {
    const { email, authenWith } = body;
    const account = await Account.findOne({ email });

    // Kiểm tra nếu tài khoản đã tồn tại với phương thức xác thực tương tự
    if (account) {
        if ((authenWith === 0 && account.authenWith === 0) ||
            (authenWith === 1 && account.authenWith === 1) ||
            (authenWith === 2 && account.authenWith === 2) ||
            (authenWith === 3 && account.authenWith === 3)) {
            throw new Error('Account has existed');
        } else {
            // Tạo tài khoản dựa trên tài khoản đã tồn tại
            const newAccount = await createAccountWithOldUserID(body);
            if (newAccount) {
                return {
                    success: true,
                    message: authenWith === 1
                        ? 'Register with Google successfully'
                        : authenWith === 2
                            ? 'Register with Facebook successfully'
                            : authenWith === 3
                                ? 'Register with GitHub successfully'
                                : 'Register successfully'
                };
            }
        }
    } else {
        // Đăng ký tài khoản mới
        const newAccount = await registerAccount(body);
        if (newAccount) {
            return {
                success: true,
                message: 'Register is successfully. Please login with email and password'
            };
        }
    }
    throw new Error('Something went wrong');
};

const registerAccount = async (data: any) => {
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

const loginService = async (email: string, password: string) => {
    const account = await Account.findOne({ email });
    if (account && await account.isCorrectPassword(password)) {
        const { password, role, ...accountData } = account.toObject();
        // create accesstoken 
        const accessToken = generateAccessToken(account._id as string, role);
        // create refresh token 
        const refreshToken = generateRefreshToken(account._id as string);
        return { accessToken, accountData };
    } else {
        throw new Error('Invalid credentials!');
    }
};

export { registerService, loginService }