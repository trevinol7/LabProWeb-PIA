const express = require('express');
const { 
  createReport, 
  getMyReports, 
  getAllReports,
  getReportById 
} = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, createReport);
router.get('/my-reports', verifyToken, getMyReports);
router.get('/all', getAllReports);
router.get('/:id', getReportById);

module.exports = router;
