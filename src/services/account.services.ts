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
        username: data.username,
        account: [account._id]  // Liên kết với tài khoản mới tạo
    })
    account.user = user._id
    await account.save();
    return account
}

const createAccountWithOldUserID = (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu tài khoản đã tồn tại
            const accountExist = await Account.findOne({ email: data.email });
            if (accountExist) {
                // Gán userID từ tài khoản đã tồn tại vào data
                data.user = accountExist.user;
            }
            // Tạo tài khoản mới
            const newAccount = await Account.create(data);
            // Tìm user tương ứng
            const userExist = await User.findOne({ _id: newAccount.user });
            if (userExist) {
                // Thêm account ID vào mảng account của user
                userExist.account.push(newAccount._id);
                await userExist.save();
            }
            // Trả về tài khoản mới
            resolve(newAccount);
            loginService(newAccount.email, newAccount.password, newAccount.authenWith)
        } catch (error: any) {
            // Nếu có lỗi, reject với thông báo lỗi
            reject(new Error(`Failed to create new account with UserId: ${error.message}`));
        }
    });
};

const createAllToken = async (account: any) => {
    // create accesstoken 
    const accessToken = generateAccessToken(account._id.toString(), account.role);
    // create refresh token 
    const refreshToken = generateRefreshToken(account._id.toString());
    // save refreshToken in Database 
    await User.findByIdAndUpdate(account.user, { refreshToken }, { new: true })
    return { accessToken, refreshToken }
}

const loginService = async (email: string, password: string, authenWith: number) => {
    const account = await Account.findOne({ email });
    if (account && authenWith >= 0 && authenWith <= 3) {
        if (authenWith === 0 && !(await account.isCorrectPassword(password))) {
            throw new Error('Invalid credentials!');
        }
        const { role, ...accountData } = account.toObject();
        // create all token 
        const { accessToken, refreshToken } = await createAllToken(account);
        return { accessToken, refreshToken, accountData };
    } else {
        throw new Error('Invalid credentials!');
    }
    // if (authenWith === 0 && account && await account.isCorrectPassword(password)) {
    //     const { password, role, ...accountData } = account.toObject();
    //     // create all token 
    //     const { accessToken, refreshToken } = await createAllToken(account);
    //     return { accessToken, refreshToken, accountData };
    // } else {
    //     throw new Error('Invalid credentials!');
    // }
};

export { registerService, loginService }