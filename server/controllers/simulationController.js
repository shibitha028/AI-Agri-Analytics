const AgriculturalData = require('../models/AgriculturalData');
const Scenario = require('../models/Scenario');
const { simulateScenario, average, round } = require('../services/analyticsService');

// @route POST /api/simulation
// Body: { district, crop, rainfallChangePercent, temperatureChangeC, humidityChangePercent }
exports.runSimulation = async (req, res, next) => {
  try {
    const { district, crop, rainfallChangePercent = 0, temperatureChangeC = 0, humidityChangePercent = 0 } = req.body;

    if (!district || !crop) {
      return res.status(400).json({ success: false, message: 'Please select a district and crop.' });
    }

    const records = await AgriculturalData.find({
      district: new RegExp(`^${district}$`, 'i'),
      crop: new RegExp(`^${crop}$`, 'i')
    });

    const historicalYields = records.map((r) => r.yield).filter((v) => typeof v === 'number');
    const baselineYield = round(average(historicalYields));

    if (!baselineYield) {
      return res.status(404).json({
        success: false,
        message: `No sufficient historical yield data found for ${crop} in ${district}. Cannot run a scenario simulation.`
      });
    }

    const result = simulateScenario({
      baselineYield,
      rainfallChangePercent: Number(rainfallChangePercent),
      temperatureChangeC: Number(temperatureChangeC),
      humidityChangePercent: Number(humidityChangePercent)
    });

    if (req.user) {
      await Scenario.create({
        userId: req.user._id,
        district,
        crop,
        inputConditions: {
          rainfallChangePercent: Number(rainfallChangePercent),
          temperatureChangeC: Number(temperatureChangeC),
          humidityChangePercent: Number(humidityChangePercent)
        },
        baselineYield: result.currentValue,
        estimatedYield: result.simulatedValue,
        riskLevel: result.riskLevel,
        resultType: 'Scenario Simulation'
      });
    }

    res.json({
      success: true,
      district,
      crop,
      basedOnRecords: records.length,
      ...result
    });
  } catch (err) {
    next(err);
  }
};
