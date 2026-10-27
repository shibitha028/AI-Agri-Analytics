const express = require('express');
const router = express.Router();
const { runSimulation } = require('../controllers/simulationController');
const { protect } = require('../middleware/auth');

router.post('/', protect, runSimulation);

module.exports = router;
