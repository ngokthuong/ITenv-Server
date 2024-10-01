declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; // depending on your JWT payload structure
    }
  }
}
