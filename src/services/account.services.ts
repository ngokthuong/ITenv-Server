import User from "../models/user";
import Account from "../models/account";
import { generateAccessToken, generateRefreshToken } from '../middleware/jwt.mdw'
import { verifyOTP } from "../services/otp.service"
import lodash from 'lodash'
import axios from "axios";
import jwt from 'jsonwebtoken'
import { Err } from "joi";

const verifyAndRegisterService = async (body: any) => {
    const { email, otp } = body
    // verify OTP
    const verifyOtp = await verifyOTP(email, otp)
    if (!verifyOtp)
        return {
            success: false,
            message: 'verify OTP is error'
        }
    const newAccount = await registerAccount(body);
    return {
        success: newAccount ? true : false,
        message: newAccount ? 'Register is successfully. Please login with email and password' : 'Something went wrong'
    }
};

const registerAccount = async (data: any): Promise<object> => {
    // check email is existed 
    const account = await Account.create(data)
    const user = await User.create({
        username: data.username,
        account: [account._id]
    })
    account.user = user._id
    return await account.save();
}

const checkAccountExisted = async (email: string): Promise<boolean> => {
    if (await Account.findOne({ email }))
        return true;
    return false;
}


const createAccountWithOAuth = async (data: any) => {
    try {
        const accountExist = await Account.findOne({ email: data.email });
        if (accountExist) {
            // Assign the UserID from the existing account to the data
            data.user = accountExist.user;
            const newAccount = await Account.create(data);

            // Find the corresponding user
            const userExist = await User.findOne({ _id: newAccount.user });
            if (userExist) {
                userExist.account.push(newAccount._id);
                await userExist.save();
            }
            return newAccount;
        }
        return null;
    } catch (error: any) {
        throw new Error(`Failed to create new account with UserId: ${error.message}`);
    }
};

const createAllToken = async (account: any) => {
    // create accesstoken 
    const accessToken = generateAccessToken(account._id.toString(), account.role, account.user.toString());
    // create refresh token 
    const refreshToken = generateRefreshToken(account._id.toString());
    // save refreshToken in Database 
    await Account.findByIdAndUpdate(account._id, { refreshToken }, { new: true })
    return { accessToken, refreshToken }
}

const dataResponseClientWhenLogin = async (account: any, user: any) => {
    const accountData = await lodash.omit(account.toObject(), ['_id', 'role', 'password', 'passwordChangeAt', 'passwordResetToken', 'passwordResetExpires', 'refreshToken', 'user'])
    const { accessToken, refreshToken } = await createAllToken(account);
    const dataResponse = await { accountData, userName: user?.username || "no data" }
    return { dataResponse, accessToken, refreshToken }
}

const loginService = async (data: any) => {
    try {
        const { email, authenWith, password } = data;
        // find account with email
        const account = await Account.findOne({ email });
        const user = await User.findById(account?.user);
        // check isBlocked
        if (await accIsBlocked(account))
            return {
                success: false,
                message: 'Your account is blocked'
            }
        // if else with account.authenWith ==0 and compare password
        if (account && authenWith === 0 && account.authenWith === 0) {
            if (await account.isCorrectPassword(password)) {
                const { dataResponse, accessToken, refreshToken } = await dataResponseClientWhenLogin(account, user);
                return { accessToken, refreshToken, dataResponse };
            }
            return {
                success: false,
                message: 'The user has entered an incorrect password'
            }
        }
        // if authen is [1||2||3] 
        if (authenWith >= 1 && authenWith <= 3) {
            const existingAccounts = await Account.find({ email, authenWith: { $in: [1, 2, 3] } });
            const existingAuthenWith = existingAccounts.map(acc => acc.authenWith);
            // If there isn't an account with the specified authenWith, then create a new account with a new authenWith
            if (!existingAuthenWith.includes(authenWith)) {
                const newAccount = account ? await createAccountWithOAuth(data) : await registerAccount(data);
                const { dataResponse, accessToken, refreshToken } = await dataResponseClientWhenLogin(newAccount, user);
                return { accessToken, refreshToken, dataResponse };
            }
            // if account with authenWith is existed then return token and accountWithMailAuth
            const accountWithMailAuth = await Account.findOne({ email, authenWith });
            const { dataResponse, accessToken, refreshToken } = await dataResponseClientWhenLogin(accountWithMailAuth, user);
            return { accessToken, refreshToken, dataResponse }
        }
    } catch (error: any) {
        return {
            success: false,
            message: 'invalid credential'
        }
    }

};

// check block user account 
const accIsBlocked = async (account: any): Promise<boolean> => {
    return account.isBlocked;
};

const exchangeGithubCodeForToken = async (code: string) => {
    const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
            client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
            client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
            code,
        },
        { headers: { Accept: 'application/json' } }
    );
    return tokenResponse.data.access_token;
};

const fetchGithubUserData = async (accessToken: string) => {
    const userResponse = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return userResponse.json();
};

const fetchGithubUserEmail = async (accessToken: string) => {
    const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const emailData = await emailResponse.json();
    return emailData[0]?.email;
};

// LOGOUT 
export const logoutService = async (refreshToken: string) => {
    try {
        await Account.findOneAndUpdate({ refreshToken: refreshToken }, { refreshToken: '' }, { new: true })
        return {
            success: true,
            message: "logout is successully"
        }
    } catch (err) {
        return {
            success: false,
            message: (err as Error).message
        }
    }
}
// REFRESH TOKEN
export const refreshAccessTokenService = async (refreshToken: string) => {
    try {
        // Verify the refresh token
        return await jwt.verify(refreshToken, process.env.JWT_SECRET as string, async (err: any, decode: any) => {
            if (err)
                return {
                    success: false,
                    message: 'Refresh token expired'
                }
            const account = await Account.findOne({
                _id: decode._id,
                refreshToken: refreshToken
            });
            return {
                success: account ? true : false,
                newAccessToken: account ? await generateAccessToken(account._id.toString(), account.role, account.user.toString()) : 'refreshToken invalid',
                message: account ? 'New access token is created' : 'refreshToken invalid'
            }
        });
    } catch (error: any) {
        return {
            success: false,
            newAccessToken: 'null',
            message: error.message
        }
    }
};

// FORGOT PASSWORD 
export const forgotPassService = async () => {

}
export { verifyAndRegisterService, loginService, exchangeGithubCodeForToken, fetchGithubUserData, fetchGithubUserEmail, checkAccountExisted }