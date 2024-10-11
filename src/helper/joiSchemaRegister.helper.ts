import Joi from 'joi'

const allowedDomains = [
    'gmail.com',
    'yourcompany.com',
    'example.org',
    'yourinstitution.edu',
    'edu.vn'
];
const domainPattern = allowedDomains.join('|').replace(/\./g, '\\.');

export const schema = Joi.object({
    email: Joi.string()
        .pattern(new RegExp(`^[a-zA-Z0-9._%+-]+@(${domainPattern})$`))
        .required(),
    username: Joi.string().required(),
    authenWith: Joi.number().valid(0).required(),
    password: Joi.string().required().min(6),
});

export const passwordResetPass = Joi.object({
    newPassword: Joi.string().min(6).required(),
    email: Joi.string().required()
});

