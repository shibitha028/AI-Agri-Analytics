const express = require('express');
const router = express.Router();
const { askQuestion } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/ask', protect, askQuestion);

module.exports = router;
