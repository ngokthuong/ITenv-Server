import { NextFunction } from "express"
import { AuthRequest } from "../types/AuthRequest.type"
import { EnumRoleAccount } from "../enums/schemaAccount.enum"

export const isAdmin = (req: AuthRequest, res: any, next: NextFunction) => {
    const role_code = req.user?.role
    if (role_code !== EnumRoleAccount.ROLE_ADMIN)
        throw new Error("Account is not Admin")
    next()
}

export const isUser = (req: AuthRequest, res: any, next: NextFunction) => {
    const role_code = req.user?.role
    if (role_code !== EnumRoleAccount.ROLE_USER)
        throw new Error("Account is not User")
    next()
}