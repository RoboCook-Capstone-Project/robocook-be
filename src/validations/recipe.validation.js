import Joi from "joi";

const forYouPage = {
    query: Joi.object().keys({
        page: Joi.number().integer(),
        size: Joi.number().integer(),
    }),
};

export default {
    forYouPage,
};
