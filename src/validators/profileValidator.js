const Joi = require('@hapi/joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional().allow(''),
}).or('name', 'email', 'password'); 

module.exports = { updateProfileSchema };