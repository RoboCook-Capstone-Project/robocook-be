const ApiResponse = (res, statusCode, message, data, meta) => {
    const response = {
        timestamp: Date.now(),
        status: statusCode,
        message: message || httpStatus[`${statusCode}_MESSAGE`],
        data: data,
        meta: meta,
    };

    res.status(statusCode).json(response);
};

export default ApiResponse;
