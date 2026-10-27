const WaterResource = require('../models/WaterResource');

// GET /api/water-resources?district=&year=&season=
exports.getWaterResources = async (req, res, next) => {
  try {
    const { district, year, season } = req.query;
    const filter = {};
    if (district) filter.district = district;
    if (year) filter.year = +year;
    if (season) filter.season = season;

    const records = await WaterResource.find(filter).sort({ year: 1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

// GET /api/water-resources/summary?district=
// Gives district-level totals + season-wise storage comparison for charts
exports.getWaterResourceSummary = async (req, res, next) => {
  try {
    const { district } = req.query;
    if (!district) {
      return res.status(400).json({ success: false, message: 'Please select a district.' });
    }

    const records = await WaterResource.find({ district });
    if (!records.length) {
      return res.json({
        success: true,
        message: 'No water resource data available for this district yet.',
        data: null
      });
    }

    // Latest year's counts represent the district's current water body inventory
    const latest = records.reduce((a, b) => (a.year > b.year ? a : b));

    const bySeasonMap = {};
    records.forEach((r) => {
      if (!bySeasonMap[r.season]) bySeasonMap[r.season] = [];
      bySeasonMap[r.season].push(r.storagePercentage);
    });

    const seasonWiseAvgStorage = Object.keys(bySeasonMap).map((season) => ({
      season,
      averageStoragePercent: +(
        bySeasonMap[season].reduce((a, b) => a + b, 0) / bySeasonMap[season].length
      ).toFixed(1)
    }));

    const yearWise = records
      .map((r) => ({
        year: r.year,
        season: r.season,
        storagePercentage: r.storagePercentage,
        currentStorageMCM: r.currentStorageMCM,
        rainfallMM: r.rainfallMM ?? null
      }))
      .sort((a, b) => a.year - b.year);

    res.json({
      success: true,
      data: {
        district,
        waterBodies: {
          rivers: latest.riverCount,
          ponds: latest.pondCount,
          lakes: latest.lakeCount,
          reservoirs: latest.reservoirCount,
          total: latest.riverCount + latest.pondCount + latest.lakeCount + latest.reservoirCount
        },
        totalStorageCapacityMCM: latest.totalStorageCapacityMCM,
        seasonWiseAvgStorage,
        yearWise,
        resultType: 'Analytics-Based Estimate'
      }
    });
  } catch (err) {
    next(err);
  }
};
