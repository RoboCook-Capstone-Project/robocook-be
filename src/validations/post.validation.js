import Joi from "joi";

const createPost = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        content: Joi.string(),
        published: Joi.boolean(),
        authorId: Joi.number().integer().required(),
    }),
};

const deletePost = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

export default {
    createPost,
    deletePost,
};
