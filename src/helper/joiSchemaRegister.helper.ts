import Joi from 'joi'

const allowedDomains = [
    'gmail.com',
    'yourcompany.com',
    'example.org',
    'yourinstitution.edu'
];
const domainPattern = allowedDomains.join('|').replace(/\./g, '\\.'); // Thay thế '.' bằng '\.'


// Định nghĩa schema Joi chỉ bao gồm các trường cần xác thực
export const schema = Joi.object({
    // email: Joi.string().pattern(new RegExp('gmail.com$')).required(),
    email: Joi.string()
        .pattern(new RegExp(`^[a-zA-Z0-9._%+-]+@(${domainPattern})$`))
        .required(),
    username: Joi.string().required(),
    authenWith: Joi.number().valid(0).required(),
    password: Joi.string().required().min(6),
});

export const passwordResetPass = Joi.object({
    newPassword: Joi.string().min(6).required(),
    token: Joi.string().required()
});

