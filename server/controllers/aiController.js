const AgriculturalData = require('../models/AgriculturalData');
const { askAssistant } = require('../services/aiService');

// @route POST /api/ai/ask
exports.askQuestion = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a question.' });
    }

    const knownDistricts = await AgriculturalData.distinct('district');
    const result = await askAssistant(question, knownDistricts);

    res.json({
      success: true,
      question,
      answer: result.answer,
      source: result.source,
      usedAI: result.usedAI
    });
  } catch (err) {
    next(err);
  }
};
