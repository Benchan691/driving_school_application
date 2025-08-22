const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    console.error('💥 ERROR:', err);
  
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      // Include stack trace only in development for debugging
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  };
  
  export default globalErrorHandler;