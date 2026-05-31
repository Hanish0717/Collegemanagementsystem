import fs from 'fs';
import path from 'path';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error("Error occurred in request handler:", err);

  try {
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${statusCode} - Error: ${message}\nStack: ${err.stack}\nBody: ${JSON.stringify(req.body)}\n\n`;
    fs.appendFileSync('error_log.txt', logMessage);
  } catch (logErr) {
    console.error("Failed to write to error log file:", logErr);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
