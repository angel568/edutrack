const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'No autorizado. Token requerido.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
    if (!req.user || !req.user.activo) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo.' });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: `El rol '${req.user.rol}' no tiene acceso a este recurso.`,
    });
  }
  next();
};

module.exports = { protect, authorize };
