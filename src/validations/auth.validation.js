import Joi from "joi";

const register = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        name: Joi.string().required(),
    }),
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
    }),
};

export default { register, login };
