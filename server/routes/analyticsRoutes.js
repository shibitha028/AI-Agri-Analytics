const express = require('express');
const router = express.Router();
const { getRainfallAnalytics, getCropAnalytics, getSoilAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/rainfall', protect, getRainfallAnalytics);
router.get('/crop', protect, getCropAnalytics);
router.get('/soil', protect, getSoilAnalytics);

module.exports = router;
