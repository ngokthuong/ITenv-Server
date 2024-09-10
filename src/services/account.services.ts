import Account from "../model/account";
import User from "../model/user";
import { generateAccessToken, generateRefreshToken } from '../middleware/jwt.mdw'

const registerService = async (body: any) => {
    const { email } = body;
    const account = await Account.findOne({ email });

    if (account) {
        throw new Error('The email has already been used.');
    } else {
        // sign up a new account 
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
    // check email is existed 
    const account = await Account.create(data)
    const user = await User.create({
        username: data.username,
        account: [account._id]
    })
    account.user = user._id
    await account.save();
    return account
}

const createAccountWithOldUserID = (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            // check account existed 
            const accountExist = await Account.findOne({ email: data.email });
            if (accountExist) {
                // Assign the UserID from the existing account to the data
                data.user = accountExist.user;
            }
            // create new account 
            const newAccount = await Account.create(data);
            // find the corresponding user
            const userExist = await User.findOne({ _id: newAccount.user });
            if (userExist) {
                // add account ID in account aray of user
                userExist.account.push(newAccount._id);
                await userExist.save();
            }
            resolve(newAccount);
        } catch (error: any) {
            // if error, reject with a error memo
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
const loginService = async (data: any) => {
    const { email, authenWith, password } = data;
    // Tìm tài khoản với email
    const account = await Account.findOne({ email });
    // Xử lý khi `authenWith === 0` và so sánh mật khẩu
    if (account && authenWith === 0 && account.authenWith === 0) {
        if (password === account.password) {
            const { role, ...accountData } = account.toObject();
            const { accessToken, refreshToken } = await createAllToken(account);
            return { accessToken, refreshToken, accountData };
        }
        throw new Error('Invalid credentials!');
    }
    // Xử lý khi `authenWith` thuộc giá trị 1, 2, hoặc 3
    if (authenWith >= 1 && authenWith <= 3) {
        const existingAccounts = await Account.find({ email, authenWith: { $in: [1, 2, 3] } });
        const existingAuthenWith = existingAccounts.map(acc => acc.authenWith);
        // Nếu không có tài khoản với `authenWith` hiện tại, tạo tài khoản mới
        if (!existingAuthenWith.includes(authenWith)) {
            const newAccount = account ? await createAccountWithOldUserID(data) : await registerAccount(data);
            const { accessToken, refreshToken } = await createAllToken(newAccount);
            return { accessToken, refreshToken, accountData: newAccount };
        }
        // Nếu đã tồn tại tài khoản với `authenWith`, trả về token
        const accountWithMailAuth = await Account.findOne({ email, authenWith });
        const { accessToken, refreshToken } = await createAllToken(accountWithMailAuth);
        return { accessToken, refreshToken, accountData: accountWithMailAuth }
    }
    throw new Error('Invalid credentials!');
};

export { registerService, loginService }