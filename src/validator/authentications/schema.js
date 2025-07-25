const Joi = require('joi');

const PostAuthenticationPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const refreshToken = Joi.string().required();

const PutAuthenticationPayloadSchema = Joi.object({ refreshToken });

const DeleteAuthenticationPayloadSchema = Joi.object({ refreshToken });

module.exports = {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
};
