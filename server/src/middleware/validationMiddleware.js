export const validateRequest = (validationFn) => {
  return (req, res, next) => {
    const { errors, isValid } = validationFn(req.body);
    if (!isValid) {
      const error = new Error(Object.values(errors).join(', '));
      error.statusCode = 400;
      return next(error);
    }
    next();
  };
};
