const ApiResponse = (
    res,
    statusCode,
    message,
    {
        recipeList = undefined,
        recipe = undefined,
        pageMeta = undefined,
        loginResult = undefined,
        registerResult = undefined,
    } = {}
) => {
    const response = {
        error: !(statusCode >= 200 && statusCode <= 299),
        message: message || httpStatus[`${statusCode}_MESSAGE`],
        list_recipe: recipeList,
        recipe: recipe,
        page_meta: pageMeta,
        login_result: loginResult,
        register_result: registerResult,
    };

    res.status(statusCode).json(response);
};

export default ApiResponse;
