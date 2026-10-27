const express = require('express');
const router = express.Router();
const { getScenarioHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getScenarioHistory);

module.exports = router;
