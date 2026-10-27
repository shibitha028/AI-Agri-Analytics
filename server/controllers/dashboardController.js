const AgriculturalData = require('../models/AgriculturalData');
const User = require('../models/User');
const { average, round, calculateSoilHealthScore, generateInsight } = require('../services/analyticsService');

// @route GET /api/dashboard
// Returns personalized dashboard stats. If req.user has a district, data is
// automatically filtered/personalized to that district (core innovation).
exports.getDashboard = async (req, res, next) => {
  try {
    const districtFilter = req.query.district || (req.user && req.user.district);

    const baseQuery = districtFilter ? { district: new RegExp(`^${districtFilter}$`, 'i') } : {};

    const records = await AgriculturalData.find(baseQuery);

    const rainfallValues = records.map((r) => r.rainfall).filter((v) => typeof v === 'number');
    const yieldValues = records.map((r) => r.yield).filter((v) => typeof v === 'number');
    const crops = [...new Set(records.map((r) => r.crop))];
    const districts = [...new Set(records.map((r) => r.district))];

    const soilRecords = records.filter((r) => r.nitrogen !== undefined && r.ph !== undefined);
    const avgSoilScore = soilRecords.length
      ? round(
          average(
            soilRecords.map((r) =>
              calculateSoilHealthScore({
                nitrogen: r.nitrogen,
                phosphorus: r.phosphorus,
                potassium: r.potassium,
                ph: r.ph
              })
            )
          ),
          0
        )
      : null;

    // Year-over-year comparison for insight generation
    const years = [...new Set(records.map((r) => r.year))].sort((a, b) => a - b);
    const latestYear = years[years.length - 1];
    const prevYear = years[years.length - 2];

    const latestRecords = records.filter((r) => r.year === latestYear);
    const prevRecords = records.filter((r) => r.year === prevYear);

    const cropCounts = {};
    records.forEach((r) => { cropCounts[r.crop] = (cropCounts[r.crop] || 0) + 1; });
    const topCrop = Object.keys(cropCounts).sort((a, b) => cropCounts[b] - cropCounts[a])[0];

    const insight = generateInsight({
      district: districtFilter || 'the selected region',
      avgRainfall: average(latestRecords.map((r) => r.rainfall)),
      prevAvgRainfall: average(prevRecords.map((r) => r.rainfall)),
      avgYield: average(latestRecords.map((r) => r.yield)),
      prevAvgYield: average(prevRecords.map((r) => r.yield)),
      topCrop
    });

    const allDistrictsCount = await AgriculturalData.distinct('district').then((d) => d.length);

    res.json({
      success: true,
      district: districtFilter || null,
      cards: {
        totalHistoricalRecords: records.length,
        averageRainfall: round(average(rainfallValues)),
        averageYield: round(average(yieldValues)),
        soilHealthScore: avgSoilScore,
        availableCrops: crops.length,
        availableDistricts: districtFilter ? districts.length : allDistrictsCount
      },
      smartAgriInsight: insight,
      cropsList: crops,
      districtsList: districts
    });
  } catch (err) {
    next(err);
  }
};
