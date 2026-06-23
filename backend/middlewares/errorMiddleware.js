const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  
  const status = err.status || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';
  
  res.status(status).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
};

module.exports = errorHandler;
