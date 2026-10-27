const AgriculturalData = require('../models/AgriculturalData');
const { average, round, calculateSoilHealthScore } = require('../services/analyticsService');

const applyFilters = (query, { state, district, year, crop, season }) => {
  if (state) query.state = new RegExp(`^${state}$`, 'i');
  if (district) query.district = new RegExp(`^${district}$`, 'i');
  if (year) query.year = Number(year);
  if (crop) query.crop = new RegExp(`^${crop}$`, 'i');
  if (season) query.season = season;
  return query;
};

// @route GET /api/analytics/rainfall
exports.getRainfallAnalytics = async (req, res, next) => {
  try {
    const query = applyFilters({}, req.query);
    const records = await AgriculturalData.find(query);

    const rainfallValues = records.map((r) => r.rainfall).filter((v) => typeof v === 'number');

    const byYear = {};
    const byDistrict = {};

    records.forEach((r) => {
      byYear[r.year] = byYear[r.year] || [];
      byYear[r.year].push(r.rainfall);

      byDistrict[r.district] = byDistrict[r.district] || [];
      byDistrict[r.district].push(r.rainfall);
    });

    const yearWise = Object.keys(byYear).sort().map((year) => ({ year: Number(year), averageRainfall: round(average(byYear[year])) }));
    const districtWise = Object.keys(byDistrict).map((d) => ({ district: d, averageRainfall: round(average(byDistrict[d])) }));

    res.json({
      success: true,
      summary: {
        average: round(average(rainfallValues)),
        highest: rainfallValues.length ? Math.max(...rainfallValues) : 0,
        lowest: rainfallValues.length ? Math.min(...rainfallValues) : 0
      },
      yearWise,
      districtWise,
      recordCount: records.length
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/analytics/crop
exports.getCropAnalytics = async (req, res, next) => {
  try {
    const query = applyFilters({}, req.query);
    const records = await AgriculturalData.find(query).sort({ year: -1 });

    const byCrop = {};
    records.forEach((r) => {
      byCrop[r.crop] = byCrop[r.crop] || { production: [], area: [], yield: [] };
      if (typeof r.production === 'number') byCrop[r.crop].production.push(r.production);
      if (typeof r.area === 'number') byCrop[r.crop].area.push(r.area);
      if (typeof r.yield === 'number') byCrop[r.crop].yield.push(r.yield);
    });

    const cropComparison = Object.keys(byCrop).map((crop) => ({
      crop,
      averageProduction: round(average(byCrop[crop].production)),
      averageArea: round(average(byCrop[crop].area)),
      averageHistoricalYield: round(average(byCrop[crop].yield))
    }));

    res.json({
      success: true,
      records,
      cropComparison,
      recordCount: records.length
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/analytics/soil
exports.getSoilAnalytics = async (req, res, next) => {
  try {
    const query = applyFilters({}, req.query);
    const records = await AgriculturalData.find(query);

    const withSoil = records.filter((r) => r.nitrogen !== undefined || r.ph !== undefined);

    const soilData = withSoil.map((r) => ({
      district: r.district,
      year: r.year,
      crop: r.crop,
      nitrogen: r.nitrogen,
      phosphorus: r.phosphorus,
      potassium: r.potassium,
      ph: r.ph,
      soilHealthScore: calculateSoilHealthScore({
        nitrogen: r.nitrogen,
        phosphorus: r.phosphorus,
        potassium: r.potassium,
        ph: r.ph
      }),
      resultType: 'Analytics-Based Estimate'
    }));

    const avgScore = round(average(soilData.map((s) => s.soilHealthScore)), 0);

    res.json({
      success: true,
      averages: {
        nitrogen: round(average(withSoil.map((r) => r.nitrogen).filter((v) => typeof v === 'number'))),
        phosphorus: round(average(withSoil.map((r) => r.phosphorus).filter((v) => typeof v === 'number'))),
        potassium: round(average(withSoil.map((r) => r.potassium).filter((v) => typeof v === 'number'))),
        ph: round(average(withSoil.map((r) => r.ph).filter((v) => typeof v === 'number'))),
        soilHealthScore: avgScore
      },
      records: soilData
    });
  } catch (err) {
    next(err);
  }
};
