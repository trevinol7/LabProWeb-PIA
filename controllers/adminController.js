const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// Obtener estadísticas
const getStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [stats] = await connection.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Pendiente' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'En proceso' THEN 1 ELSE 0 END) as progress,
        SUM(CASE WHEN status = 'Resuelto' THEN 1 ELSE 0 END) as resolved
      FROM reports`
    );

    const [categoryStats] = await connection.execute(
      `SELECT category, COUNT(*) as count FROM reports GROUP BY category`
    );

    connection.release();

    res.json({ 
      success: true, 
      stats: stats[0],
      categoryStats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas' 
    });
  }
};

// Actualizar estado del reporte
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;

    if (!['Pendiente', 'En proceso', 'Resuelto'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Estado inválido' 
      });
    }

    const connection = await pool.getConnection();

    await connection.execute(
      'UPDATE reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    connection.release();

    res.json({ 
      success: true, 
      message: 'Estado actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar estado' 
    });
  }
};

// Agregar evidencia
const addEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments, resolution_date } = req.body;
    const adminId = req.user.id;
    const adminName = req.user.name;

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere una foto' 
      });
    }

    const photoUrl = `/uploads/${req.file.filename}`;

    const connection = await pool.getConnection();

    // Verificar si existe evidencia
    const [existingEvidence] = await connection.execute(
      'SELECT id FROM evidence WHERE report_id = ?',
      [id]
    );

    if (existingEvidence.length > 0) {
      // Actualizar evidencia existente
      await connection.execute(
        `UPDATE evidence 
         SET photo_url = ?, comments = ?, admin_id = ?, admin_name = ?, resolution_date = ?
         WHERE report_id = ?`,
        [photoUrl, comments, adminId, adminName, resolution_date, id]
      );
    } else {
      // Crear nueva evidencia
      await connection.execute(
        `INSERT INTO evidence (report_id, photo_url, comments, admin_id, admin_name, resolution_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, photoUrl, comments, adminId, adminName, resolution_date]
      );
    }

    // Actualizar estado del reporte
    await connection.execute(
      'UPDATE reports SET status = "Resuelto", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    connection.release();

    res.json({ 
      success: true, 
      message: 'Evidencia agregada exitosamente' 
    });
  } catch (error) {
    console.error('Error agregando evidencia:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al agregar evidencia' 
    });
  }
};

// Obtener todos los reportes (admin)
const getAllReportsAdmin = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [reports] = await connection.execute(
      `SELECT 
        r.id, r.title, r.category, r.location, r.municipality, 
        r.description, r.status, r.created_at,
        u.name as user_name, u.email as user_email,
        e.comments as evidence_comments, e.photo_url, e.admin_name
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

module.exports = {
  getStats,
  updateReportStatus,
  addEvidence,
  getAllReportsAdmin
};
