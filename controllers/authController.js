const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Registro
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Validar entrada
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos requeridos' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    const connection = await pool.getConnection();

    // Verificar si el email ya existe
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ 
        success: false, 
        message: 'El correo ya está registrado' 
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    connection.release();

    res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado exitosamente' 
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar usuario' 
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email y contraseña requeridos' 
      });
    }

    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    const user = users[0];

    // Comparar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({ 
      success: true, 
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al iniciar sesión' 
    });
  }
};

module.exports = { register, login };
