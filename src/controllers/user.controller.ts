import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { any, string } from 'joi';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import Account from '../models/account';
import { generate } from 'otp-generator';
import { generateAccessToken } from '../middleware/jwt.mdw';


