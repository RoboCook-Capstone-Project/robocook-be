import Joi from "joi";

const forYouPage = {
    query: Joi.object().keys({
        page: Joi.number().integer(),
        size: Joi.number().integer(),
        user_id: Joi.number().integer().required(),
    }),
};

export default {
    forYouPage,
};
