const { Joi } = require('express-validation');

module.exports = {
  // POST /v1/auth/register
  register: {
    body: Joi.object({ 
        email: Joi.string().email().required(), 
        password: Joi.string().required().min(6).max(128) 
    }),
  },

  // POST /v1/auth/login
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required().max(128),
    }),
  },

  // POST /v1/auth/facebook
  // POST /v1/auth/google
  oAuth: {
    body: Joi.object({
      access_token: Joi.string().required(),
    }),
  },

  // POST /v1/auth/refresh
  refresh: {
    body: Joi.object({
      email: Joi.string().email().required(),
      refreshToken: Joi.string().required(),
    }),
  },

  // POST /v1/auth/forgot-password
  forgotPassword: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },

  // POST /v1/auth/change-password
  changePassword: {
    body: Joi.object({
      oldPassword: Joi.string().required().max(128),
      newPassword: Joi.string().required().min(6).max(128),
    }),
  },
  // POST /v1/auth/request-access-token
  requestAccessToken: {
    body: Joi.object({
      refreshToken: Joi.string().required(),
    }),
  },
};
