const Scenario = require('../models/Scenario');

// @route GET /api/history
exports.getScenarioHistory = async (req, res, next) => {
  try {
    const scenarios = await Scenario.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: scenarios.length, data: scenarios });
  } catch (err) {
    next(err);
  }
};
