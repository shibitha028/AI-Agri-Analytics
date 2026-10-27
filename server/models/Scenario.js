const mongoose = require('mongoose');

// Stores rule-based scenario simulations / analytics-based estimates
// (explicitly NOT machine-learning predictions).
const ScenarioSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    district: { type: String, required: true },
    crop: { type: String, required: true },
    inputConditions: {
      rainfallChangePercent: { type: Number, default: 0 },
      temperatureChangeC: { type: Number, default: 0 },
      humidityChangePercent: { type: Number, default: 0 }
    },
    baselineYield: { type: Number },
    estimatedYield: { type: Number },
    riskLevel: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Low' },
    resultType: { type: String, default: 'Scenario Simulation' }, // or "Analytics-Based Estimate"
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scenario', ScenarioSchema);
