const express = require('express');
const router = express.Router();
const { getAgriculturalData, getByDistrict, getFilterOptions } = require('../controllers/agricultureController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAgriculturalData);
router.get('/filters', protect, getFilterOptions);
router.get('/district/:district', protect, getByDistrict);

module.exports = router;
