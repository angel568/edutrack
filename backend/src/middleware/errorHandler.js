const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({ success: false, message: messages[0], errors: messages });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token inválido.' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor.',
  });
};

module.exports = errorHandler;
