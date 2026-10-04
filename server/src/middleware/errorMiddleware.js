// Runs when no route matches
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// Central error handler: never exposes stack traces (NFR-04)
const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message;

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  }
  if (err.name === "ValidationError") {
    status = 400;
  }
  if (status === 500 && process.env.NODE_ENV === "production") {
    message = "Server error";
  }
  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };