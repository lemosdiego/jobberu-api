export const validate = (schema) => async (request, response, next) => {
  try {
    await schema.parseAsync({
      body: request.body,
      query: request.query,
      params: request.params,
    });
    return next();
  } catch (error) {
    const errorMessages = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return response.status(400).json({ errors: errorMessages });
  }
};
