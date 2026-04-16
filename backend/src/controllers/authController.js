const jwt  = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos.' });

    const user = await User.findOne({ where: { email } });
    if (!user || !user.activo)
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });

    const isMatch = await user.compararPassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });

    const token = generateToken(user.id);
    res.json({
      success: true, token,
      user: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol },
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = (req, res) => res.json({ success: true, user: req.user });

// POST /api/auth/register  (admin only)
const register = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;
    const user = await User.create({ nombre, apellido, email, password, rol });
    res.status(201).json({
      success: true,
      user: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol },
    });
  } catch (err) { next(err); }
};

// GET /api/auth/users  (admin only)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

module.exports = { login, getMe, register, getUsers };
