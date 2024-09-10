import jwt from 'jsonwebtoken'

export const generateAccessToken = (accId: string, role: string): string => {
    return jwt.sign(
        { _id: accId, role },
        process.env.JWT_SECRET as string,
        { expiresIn: '3d' }
    );
}


export const generateRefreshToken = (accId: string): string => {
    return jwt.sign(
        { _id: accId },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );
}