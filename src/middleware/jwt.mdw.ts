import jwt from 'jsonwebtoken'

export const generateAccessToken = (accId: string, role: string, userId: string): string => {
    return jwt.sign(
        { _id: accId, role, user: userId },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );
    // return `Bearer ${token}`;
}

export const generateRefreshToken = (accId: string): string => {
    return jwt.sign(
        { _id: accId },
        process.env.JWT_SECRET as string,
        { expiresIn: '10d' }
    );
}