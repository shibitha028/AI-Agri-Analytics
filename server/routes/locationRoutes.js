const express = require('express');
const router = express.Router();
const { detectLocation, getLocationInsights } = require('../controllers/locationController');
const { protect } = require('../middleware/auth');

router.post('/', protect, detectLocation);
router.get('/insights/:district', protect, getLocationInsights);

module.exports = router;
