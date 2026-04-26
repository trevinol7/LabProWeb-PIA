const pool = require('../config/database');

// Crear reporte
const createReport = async (req, res) => {
  try {
    const { title, category, location, municipality, description } = req.body;
    const userId = req.user.id;

    if (!title || !category || !location || !municipality || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos requeridos' 
      });
    }

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      `INSERT INTO reports (title, category, location, municipality, description, user_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')`,
      [title, category, location, municipality, description, userId]
    );

    connection.release();

    res.status(201).json({ 
      success: true, 
      message: 'Reporte creado exitosamente',
      report_id: result.insertId
    });
  } catch (error) {
    console.error('Error creando reporte:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear reporte' 
    });
  }
};

// Obtener mis reportes (usuario)
const getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const connection = await pool.getConnection();

    const [reports] = await connection.execute(
      `SELECT 
        r.id, r.title, r.category, r.location, r.municipality, 
        r.description, r.status, r.created_at,
        e.comments as evidence_comments, e.photo_url
      FROM reports r
      LEFT JOIN evidence e ON r.id = e.report_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC`,
      [userId]
    );

    connection.release();

    res.json({ 
      success: true, 
      reports 
    });
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener reportes' 
    });
  }
};

// Obtener todos los reportes (público - galería)
const getAllReports = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [reports] = await connection.execute(
      `SELECT 
        r.id, r.title, r.category, r.location, r.municipality, 
        r.description, r.status, r.created_at, r.user_id,
        u.name as user_name,
        e.comments as evidence_comments, e.photo_url
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN evidence e ON r.id = e.report_id
      ORDER BY r.created_at DESC`
    );

    connection.release();

    res.json({ 
      success: true, 
      reports 
    });
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener reportes' 
    });
  }
};

// Obtener reporte por ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();

    const [reports] = await connection.execute(
      `SELECT 
        r.id, r.title, r.category, r.location, r.municipality, 
        r.description, r.status, r.created_at,
        u.name as user_name, u.email as user_email,
        e.comments as evidence_comments, e.photo_url, e.admin_name, e.resolution_date
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN evidence e ON r.id = e.report_id
      WHERE r.id = ?`,
      [id]
    );

    connection.release();

    if (reports.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reporte no encontrado' 
      });
    }

    res.json({ 
      success: true, 
      report: reports[0]
    });
  } catch (error) {
    console.error('Error obteniendo reporte:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener reporte' 
    });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAllReports,
  getReportById
};
