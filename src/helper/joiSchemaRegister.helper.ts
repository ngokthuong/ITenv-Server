import Joi, { any } from 'joi';

const allowedDomains = [
  'gmail.com',
  'yourcompany.com',
  'example.org',
  'yourinstitution.edu',
  'edu.vn',
];
const domainPattern = allowedDomains.join('|').replace(/\./g, '\\.');

export const schema = Joi.object({
  email: Joi.string()
    .pattern(new RegExp(`^[a-zA-Z0-9._%+-]+@(${domainPattern})$`))
    .required(),
  username: Joi.string().min(2).max(30).required(),
  authenWith: Joi.number().valid(0).required(),
  password: Joi.string().min(6).max(30).required(),
});

export const passwordResetPass = Joi.object({
  newPassword: Joi.string().min(6).required(),
  email: Joi.string().required(),
});

export const validateCreatePost = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  categoryId: Joi.string().required(),
}).error((errors) => {
  errors.forEach((err: any) => {
    if (err.context?.key === 'title') {
      console.log("Validation Error in 'title':", err.message);
    } else if (err.context?.key === 'content') {
      console.log("Validation Error in 'content':", err.message);
    } else if (err.context?.key === 'categoryId') {
      console.log("Validation Error in 'categoryId':", err.message);
    } else {
      console.log('Other Validation Error:', err.message);
    }
  });
  return errors; // Quan trọng: phải return lại errors để Joi tiếp tục xử lý
});
