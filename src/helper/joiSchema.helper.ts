import joi from 'joi'

export const email = joi.string().required()
export const firstName = joi.string().required()
export const lastName = joi.string().required()
export const authenWith = joi.number().required()

export const refreshToken = joi.string().required()