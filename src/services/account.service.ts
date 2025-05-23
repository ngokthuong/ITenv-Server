import User from '../models/user';
import Account from '../models/account';
import { generateAccessToken, generateRefreshToken } from '../middlewares/jwt.mdw';
import { generateAndSendOTP, verifyOtpService } from './otp.service';
import lodash from 'lodash';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { passwordResetPass } from '../helper/joiSchemaRegister.helper';
import { getInfoData } from '../utils/getInfoData.utils';
import { QueryOption } from '../types/QueryOption.type';
import { EnumRoleAccount } from '../enums/schemaAccount.enum';

const verifyAndRegisterService = async (body: any) => {
  const { email, otp } = body;
  // verify OTP
  const verifyOtp = await verifyOtpService(email, otp);
  if (!verifyOtp.success) throw new Error('verify OTP is error');
  const newAccount = await registerAccount(body);
  return {
    success: newAccount ? true : false,
    message: newAccount
      ? 'Register is successfully. Please login with email and password'
      : 'Something went wrong',
  };
};

const registerAccount = async (data: any): Promise<object> => {
  // check email is existed
  const account = await Account.create(data);
  const user = await User.create({
    username: data.username,
  });
  account.user = user._id;
  return await account.save();
};

const checkAccountExisted = async (email: string): Promise<boolean> => {
  if (await Account.findOne({ email })) return true;
  return false;
};

const createAccountWithOAuth = async (data: any) => {
  try {
    const accountExist = await Account.findOne({ email: data.email });
    if (accountExist) {
      // Assign the UserID from the existing account to the data
      data.user = accountExist.user;
      const newAccount = await Account.create(data);
      return newAccount;
    }
    return null;
  } catch (error: any) {
    throw new Error(`Failed to create new account with UserId: ${error.message}`);
  }
};

const createAllToken = async (account: any) => {
  // create accesstoken
  const accessToken = generateAccessToken(
    account._id.toString(),
    account.role,
    account.user.toString(),
  );
  // create refresh token
  const refreshToken = generateRefreshToken(account._id.toString());
  // save refreshToken in Database
  await Account.findByIdAndUpdate(account._id, { refreshToken }, { new: true });
  return { accessToken, refreshToken };
};

const dataResponseClientWhenLogin = async (account: any, user: any) => {
  // const accountData = await lodash.omit(account.toObject(), [
  //   '_id',
  //   'role',
  //   'password',
  //   'passwordChangeAt',
  //   'passwordResetToken',
  //   'passwordResetExpires',
  //   'refreshToken',
  //   'user',
  // ]);
  const { accessToken, refreshToken } = await createAllToken(account);
  const userData = {
    username: lodash.get(user, 'username', 'no data'),
    dob: lodash.get(user, 'dob', null),
    phoneNumber: lodash.get(user, 'phoneNumber', null),
    avatar: lodash.get(user, 'avatar', ''),
    posts: lodash.get(user, 'posts', []),
    notifications: lodash.get(user, 'notifications', []),
    submissions: lodash.get(user, 'submissions', []),
    gender: lodash.get(user, 'gender', null),
    status: lodash.get(user, 'status', 0),
    lastOnline: lodash.get(user, 'lastOnline', new Date()),
    email: lodash.get(account, 'email', ''),
    role: lodash.get(account, 'role', 'user'),
    isBlocked: lodash.get(account, 'isBlocked', false),
  };
  const dataResponse = { ...userData };
  return { dataResponse, accessToken, refreshToken };
};

const loginService = async (data: any) => {
  try {
    const { email, authenWith, password } = data;
    // find account with email
    const account = await Account.findOne({ email });
    const user = await User.findById(account?.user);
    // check isBlocked
    if (account && (await accIsBlocked(account)))
      return {
        success: false,
        message: 'Your account is blocked',
      };
    // if else with account.authenWith ==0 and compare password
    // console.log('account', account);
    // if (account && authenWith === 0 && account.authenWith === 0) {
    //   if (await account.isCorrectPassword(password)) {
    //     const { dataResponse, accessToken, refreshToken } = await dataResponseClientWhenLogin(
    //       account,
    //       user,
    //     );
    //     return { accessToken, refreshToken, dataResponse };
    //   }
    //   return {
    //     success: false,
    //     message: 'The user has entered an incorrect password',
    //   };
    // }
    if (authenWith === 0) {
      const existingAccounts = await Account.find({
        email,
      });
      const existingAuthenWith = existingAccounts.find((acc) => acc.authenWith === 0);
      if (!existingAuthenWith) {
        if (existingAccounts.length > 0) {
          return {
            success: false,
            message: 'You have already registered with another method.',
          };
        } else
          return {
            success: false,
            message: 'Your account is not registered with any method.',
          };
      } else {
        if (await existingAuthenWith.isCorrectPassword(password)) {
          const { dataResponse, accessToken, refreshToken } = await dataResponseClientWhenLogin(
            account,
            user,
          );
          return {
            accessToken,
            refreshToken,
            dataResponse,
            success: true,
            message: 'Login successfully',
          };
        }
        return {
          success: false,
          message: 'Wrong password',
        };
      }
    }

    // if authen is [1||2||3]
    if (authenWith >= 1 && authenWith <= 3) {
      const existingAccounts = await Account.find({ email, authenWith: { $in: [1, 2, 3] } });
      const existingAuthenWith = existingAccounts.map((acc) => acc.authenWith);
      // If there isn't an account with the specified authenWith, then create a new account with a new authenWith
      if (!existingAuthenWith.includes(authenWith)) {
        const newAccount = account
          ? await createAccountWithOAuth(data)
          : await registerAccount(data);
        const { dataResponse, accessToken, refreshToken } = await dataResponseClientWhenLogin(
          newAccount,
          user,
        );
        return {
          accessToken,
          refreshToken,
          dataResponse,
          success: true,
          message: 'Login successfully',
        };
      }
      // if account with authenWith is existed then return token and accountWithMailAuth
      const accountWithMailAuth = await Account.findOne({ email, authenWith });
      const { dataResponse, accessToken, refreshToken } = await dataResponseClientWhenLogin(
        accountWithMailAuth,
        user,
      );
      return {
        accessToken,
        refreshToken,
        dataResponse,
        success: true,
        message: 'Login successfully',
      };
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'invalid credential',
    };
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
    { headers: { Accept: 'application/json' } },
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
    await Account.findOneAndUpdate(
      { refreshToken: refreshToken },
      { refreshToken: '' },
      { new: true },
    );
    return {
      success: true,
      message: 'logout is successully',
    };
  } catch (err) {
    return {
      success: false,
      message: (err as Error).message,
    };
  }
};
// REFRESH TOKEN
export const refreshAccessTokenService = async (refreshToken: string) => {
  try {
    // Verify the refresh token
    return await jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string,
      async (err: any, decode: any) => {
        if (err)
          return {
            success: false,
            message: 'Refresh token expired',
          };
        const account = await Account.findOne({
          _id: decode._accId,
          refreshToken: refreshToken,
        });
        return {
          success: account ? true : false,
          newAccessToken: account
            ? await generateAccessToken(
                account._id.toString(),
                account.role,
                account.user.toString(),
              )
            : 'refreshToken invalid',
          message: account ? 'New access token is created' : 'refreshToken invalid',
        };
      },
    );
  } catch (error: any) {
    return {
      success: false,
      newAccessToken: 'null',
      message: error.message,
    };
  }
};

// FORGOT PASSWORD
export const forgotPassService = async (email: string) => {
  try {
    const account = await Account.findOne({ email });
    if (!account)
      return {
        success: false,
        message: 'Account is not existed',
      };
    generateAndSendOTP(email);
    return {
      success: true,
      message: 'OTP has been sent.',
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
};

// RESET PASS SERVICE
export const resetPassService = async (req: any) => {
  const { password, email } = req.body;
  const { error } = passwordResetPass.validate({
    newPassword: req.body.password,
    email: req.body.email,
  });
  if (error)
    return {
      success: false,
      message: 'Validation failed: Please provide valid input',
    };
  const account = await Account.findOne({ email });
  if (!account) throw new Error('Invalid reset token');
  account.password = password;
  account.passwordChangeAt = new Date(Date.now());
  await account.save();
  return {
    success: true,
    message: 'Reset password is successfully.',
  };
};

const getAllAccountByUserIdService = async (userId: string) => {
  try {
    let result = { email: '', authenWith: [] as number[] };
    // const Accounts = await Account.find({ user: userId });
    // const data = Accounts.map((account) => {
    //   if (!result.email) result.email = account.email;
    //   result.authenWith.push(account.authenWith);
    //   getInfoData({ fileds: ['email', 'authenWith'], object: account });
    // });
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllAccountAndUserService = async (queryOption: QueryOption) => {
  try {
    const page = queryOption?.page || 1;
    const limit = queryOption?.pageSize || 20;
    const sortField = queryOption?.sortField || 'createdAt';
    const sortOrder = queryOption?.sortOrder || 'ASC';
    const skip = (page - 1) * limit;
    const search = queryOption?.search || '';
    const accounts = await Account.find({
      email: { $regex: search, $options: 'i' },
      isDeleted: false,
    })
      .sort({ [sortField]: sortOrder === 'ASC' ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    const emailMap = new Map<string, any>();

    for (const account of accounts) {
      const existingData = emailMap.get(account.email);

      if (existingData) {
        existingData.authenWith.push(account.authenWith);
      } else {
        const Accounts = await Account.find({ email: account.email }).populate(
          'user',
          'username avatar phoneNumber lastOnline dob gender status',
        );

        const authenWith = Accounts.map((acc) => acc.authenWith);
        const data = getInfoData({ fileds: ['_id', 'email', 'role', 'user'], object: Accounts[0] });
        emailMap.set(account.email, { ...data, authenWith });
      }
    }

    const result = Array.from(emailMap.values());

    const totalAccounts = await Account.countDocuments({ isDeleted: false });
    // const totalPages = Math.ceil(totalAccounts / limit);

    return {
      data: result,
      total: totalAccounts,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ------------------------------------------------------------ADMIN----------------------------------------------------
export const editRoleUserInAccountService = async (userId: string, role: EnumRoleAccount) => {
  try {
    const result = await Account.updateMany({ user: userId }, { $set: { role: role } });
    console.log(result);
    if (result.modifiedCount <= 0)
      return { success: false, message: 'No accounts found to update.' };
    return { success: true, message: 'Role updated for all accounts.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error updating role.' };
  }
};

export {
  verifyAndRegisterService,
  loginService,
  exchangeGithubCodeForToken,
  fetchGithubUserData,
  fetchGithubUserEmail,
  checkAccountExisted,
  getAllAccountByUserIdService,
};
