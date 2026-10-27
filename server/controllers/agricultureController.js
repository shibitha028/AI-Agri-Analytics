const AgriculturalData = require('../models/AgriculturalData');

// @route GET /api/agriculture
// Supports filters: state, district, year, crop, season
exports.getAgriculturalData = async (req, res, next) => {
  try {
    const { state, district, year, crop, season, page = 1, limit = 50 } = req.query;
    const query = {};

    if (state) query.state = new RegExp(`^${state}$`, 'i');
    if (district) query.district = new RegExp(`^${district}$`, 'i');
    if (year) query.year = Number(year);
    if (crop) query.crop = new RegExp(`^${crop}$`, 'i');
    if (season) query.season = season;

    const skip = (Number(page) - 1) * Number(limit);

    const [records, total] = await Promise.all([
      AgriculturalData.find(query).sort({ year: -1 }).skip(skip).limit(Number(limit)),
      AgriculturalData.countDocuments(query)
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: records
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/agriculture/district/:district
exports.getByDistrict = async (req, res, next) => {
  try {
    const { district } = req.params;
    const records = await AgriculturalData.find({ district: new RegExp(`^${district}$`, 'i') }).sort({ year: -1 });

    if (!records.length) {
      return res.json({ success: true, district, message: 'No historical records found for this district yet.', data: [] });
    }

    res.json({ success: true, district, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/agriculture/filters (helper - returns available filter options)
exports.getFilterOptions = async (req, res, next) => {
  try {
    const [states, districts, crops, years, seasons] = await Promise.all([
      AgriculturalData.distinct('state'),
      AgriculturalData.distinct('district'),
      AgriculturalData.distinct('crop'),
      AgriculturalData.distinct('year'),
      AgriculturalData.distinct('season')
    ]);

    res.json({
      success: true,
      states,
      districts,
      crops,
      years: years.sort((a, b) => b - a),
      seasons
    });
  } catch (err) {
    next(err);
  }
};
