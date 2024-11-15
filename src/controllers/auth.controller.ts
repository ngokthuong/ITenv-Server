import asyncHandler from 'express-async-handler';
import {
  refreshAccessTokenService,
  verifyAndRegisterService,
  loginService,
  exchangeGithubCodeForToken,
  fetchGithubUserData,
  fetchGithubUserEmail,
  checkAccountExisted,
  logoutService,
  forgotPassService,
  resetPassService,
} from '../services/index.service';
import { NextFunction, Request, Response } from 'express';
import { schema } from '../helper/joiSchemaRegister.helper';
import { generateAndSendOTP, verifyOtpService } from '../services/otp.service';
import { addRefreshTokenToCookie, clearRefreshTokenInCookie } from '../middlewares/cookie.mdw';

// OTP
export const createAndSendOtp = asyncHandler(async (req: any, res: any) => {
  const { error } = schema.validate(req.body, { allowUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid credentials in sign up!',
    });
  }
  // checkemail function
  if (await checkAccountExisted(req.body.email)) {
    return res.status(404).json({
      success: false,
      message: 'This email is already in user!',
    });
  }
  // create and sent otp
  try {
    const resultOtp = await generateAndSendOTP(req.body.email);
    return res.status(200).json({
      success: resultOtp.success,
      message: resultOtp.message,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate or send OTP',
      error: error.message || 'Internal server error',
    });
  }
});

export const verifyAndRegisterController = asyncHandler(async (req: any, res: any) => {
  try {
    // verify and create account
    const result = await verifyAndRegisterService(req.body);
    return res.status(200).json({
      success: result.success,
      message: result.message,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// LOGIN + CREATE TOKEN
export const loginController = asyncHandler(async (req: any, res: any, next) => {
  try {
    // const { accessToken, refreshToken, dataResponse } = await loginService(req.body);
    const resultLoginService = await loginService(req.body);
    if (resultLoginService?.success === false) {
      return res.status(200).json({
        success: resultLoginService?.success,
        message: resultLoginService?.message,
      });
    }
    if (resultLoginService?.refreshToken)
      // save refreshToken in cookie
      addRefreshTokenToCookie(res, resultLoginService?.refreshToken);
    else {
      return res.status(200).json({
        success: false,
        message: 'Failed to generate refresh token',
      });
    }
    return res.status(200).json({

      success: resultLoginService?.success,
      message: resultLoginService?.message,
      data: {
        token: resultLoginService?.accessToken,
        userData: resultLoginService?.dataResponse,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});

// LOGIN GITHUB
export const githubOauthController = asyncHandler(async (req: Request, res: Response, next) => {
  const { code } = req.body;
  try {
    const accessToken = await exchangeGithubCodeForToken(code);
    const userData = await fetchGithubUserData(accessToken);
    const email = await fetchGithubUserEmail(accessToken);
    userData.email = email || userData.email;
    const dataResp = {
      email: userData.email,
      username: userData.name || userData.login,
      authenWith: 3,
    };
    req.body = dataResp;
    loginController(req, res, next);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
export const googleOauthController = asyncHandler(
  async (req: Request, res: Response, next): Promise<void> => {
    const { accessToken } = req.body;

    try {
      // Make the request to Google API to fetch user info
      const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!googleResponse.ok) {
        res
          .status(googleResponse.status)
          .json({ message: 'Failed to fetch Google profile information' });
        return;
      }
      const googleProfile = await googleResponse.json();
      const { name, email } = googleProfile;
      const dataResp = { username: name, email, authenWith: 1 };
      req.body = dataResp;
      loginController(req, res, next);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching Google profile information' });
    }
  },
);
// LOGOUT
export const logoutController = asyncHandler(async (req: any, res: any) => {
  const cookie = req.cookies;
  if (!cookie || !cookie.refreshToken)
    return res.status(400).json({
      success: false,
      message: 'No refresh Token in cookies',
    });
  const result = await logoutService(cookie.refreshToken);
  //    delete refresh token in cookie
  clearRefreshTokenInCookie(res);
  return res.status(200).json({
    success: (await result).success,
    message: (await result).message,
  });
});

// CREATE NEW ACCESSTOKEN WITH REFRESH TOKEN
export const refreshAccessToken = asyncHandler(async (req: any, res: any) => {
  // Get the token from cookies
  const refreshToken = req.cookies?.refreshToken;
  console.log(refreshToken)
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'No refresh token in cookie',
    });
  }
  try {
    const result = await refreshAccessTokenService(refreshToken);
    return res.status(200).json({
      success: result?.success,
      message: result?.message,
      newAccessToken: result?.newAccessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

// FORGOT PASSWORD -> CHANGE PASSWORK OF USER
export const forgotPassController = asyncHandler(async (req: any, res: any) => {
  const { email } = req.body;
  if (!email) throw new Error('missing email');
  const result = forgotPassService(email.toString());
  return res.status(200).json({
    success: (await result).success,
    message: (await result).message,
  });
});

export const verifyOtpController = asyncHandler(async (req: any, res: any) => {
  try {
    const result = await verifyOtpService(req.body.email, req.body.otp);
    return res.status(200).json({
      success: result.success,
      message: result.message,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
})

export const resetPassController = asyncHandler(async (req: any, res: any) => {
  const result = await resetPassService(req);
  return res.status(200).json({
    success: (await result).success,
    message: (await result).message,
  });
});

