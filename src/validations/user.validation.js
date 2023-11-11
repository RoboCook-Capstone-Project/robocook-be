import Joi from "joi";

const getUserById = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

const createUser = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        name: Joi.string().required(),
    }),
};

const updateUser = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
    body: Joi.object()
        .keys({
            email: Joi.string().email().required(),
            name: Joi.string().required(),
        })
        .min(1),
};

const deleteUser = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

const getUserPosts = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

const getUserDrafts = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

export default {
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserPosts,
    getUserDrafts,
};
