import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: { _accId: string; role: string; userId: string };
}
