import Joi from 'joi'

// Định nghĩa schema Joi chỉ bao gồm các trường cần xác thực
const schema = Joi.object({
    email: Joi.string().pattern(new RegExp('gmail.com$')).required(),
    username: Joi.string().required().messages({
        'any.required': 'username is required'
    }),
    authenWith: Joi.number().integer().required().messages({
        'number.base': 'Authentication method must be a number',
        'any.required': 'Authentication method is required'
    }),
    password: Joi.string().required().min(6),
});

export default schema;

