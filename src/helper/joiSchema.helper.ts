import Joi from 'joi'

// Định nghĩa schema Joi chỉ bao gồm các trường cần xác thực
const schema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
    }),
    firstName: Joi.string().required().messages({
        'any.required': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
        'any.required': 'Last name is required'
    }),
    authenWith: Joi.number().integer().required().messages({
        'number.base': 'Authentication method must be a number',
        'any.required': 'Authentication method is required'
    })
});

export default schema;

