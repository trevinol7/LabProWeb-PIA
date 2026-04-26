const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
  getStats,
  updateReportStatus,
  addEvidence,
  getAllReportsAdmin
} = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Configurar multer para subidas de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }
});

router.get('/stats', verifyToken, verifyAdmin, getStats);
router.get('/reports', verifyToken, verifyAdmin, getAllReportsAdmin);
router.put('/reports/:id/status', verifyToken, verifyAdmin, updateReportStatus);
router.post('/reports/:id/evidence', verifyToken, verifyAdmin, upload.single('photo'), addEvidence);

module.exports = router;
