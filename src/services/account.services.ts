import Otp from "../models/otp"
import User from "../models/user";
import Account from "../models/account";
import { generateAccessToken, generateRefreshToken } from '../middleware/jwt.mdw'
import { verifyOTP } from "../services/otp.service"
import lodash from 'lodash'
import axios from "axios";
import message from "../models/message";

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
    if (newAccount) {
        return {
            success: true,
            message: 'Register is successfully. Please login with email and password'
        };
    } else {
        return {
            success: true,
            message: 'Something went wrong'
        }
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

            return newAccount; // Return the newly created account
        }
        return null; // In case accountExist does not exist, return null or handle this case as needed
    } catch (error: any) {
        throw new Error(`Failed to create new account with UserId: ${error.message}`);
    }
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

const dataResponseClientWhenLogin = async (account: any, user: any) => {
    const accountData = await lodash.omit(account.toObject(), ['_id', 'role', 'password', 'passwordChangeAt', 'passwordResetToken', 'passwordResetExpires', 'user'])
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
        if (await isBlocked(account))
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
            message: error.message
        }
    }

};

// check block user account 

const isBlocked = async (account: any): Promise<boolean> => {
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

export { verifyAndRegisterService, loginService, exchangeGithubCodeForToken, fetchGithubUserData, fetchGithubUserEmail, checkAccountExisted }