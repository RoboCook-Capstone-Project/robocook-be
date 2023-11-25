const ApiResponse = (
    res,
    statusCode,
    message,
    {
        recipeList = undefined,
        recipe = undefined,
        pageMeta = undefined,
        user = undefined,
    } = {}
) => {
    const response = {
        error: !(statusCode >= 200 && statusCode <= 299),
        message: message || httpStatus[`${statusCode}_MESSAGE`],
        recipe_list: recipeList,
        recipe: recipe,
        page_meta: pageMeta,
        user: user,
    };

    res.status(statusCode).json(response);
};

export default ApiResponse;
