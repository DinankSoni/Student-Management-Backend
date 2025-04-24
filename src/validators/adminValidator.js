const Joi = require('@hapi/joi');

const adminLoginSchema = Joi.object({
  username: Joi.string().min(2).max(255).required(), // Can be username or email
  password: Joi.string().min(6).required(),
});

const updateStudentSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional().allow(''),
}).or('name', 'email', 'password'); // At least one field must be provided

module.exports = { adminLoginSchema, updateStudentSchema };