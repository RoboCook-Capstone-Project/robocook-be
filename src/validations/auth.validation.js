import Joi from "joi";

const createUser = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        name: Joi.string().required(),
    }),
};

export default { createUser };
