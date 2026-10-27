const express = require('express');
const router = express.Router();
const { getWaterResources, getWaterResourceSummary } = require('../controllers/waterResourceController');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, getWaterResourceSummary);
router.get('/', protect, getWaterResources);

module.exports = router;
