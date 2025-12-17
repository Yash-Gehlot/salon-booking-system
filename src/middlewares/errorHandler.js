const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  if (err.name === "SequelizeValidationError") {
    error.message = err.errors.map((e) => e.message).join(", ");
    error.statusCode = 400;
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    error.message = "Duplicate field value entered";
    error.statusCode = 400;
  }

  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token";
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

export default errorHandler;
