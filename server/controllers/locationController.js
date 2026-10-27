const LocationHistory = require('../models/LocationHistory');
const AgriculturalData = require('../models/AgriculturalData');
const { estimateDistrict } = require('../utils/districtGeocode');
const { average, round, generateInsight } = require('../services/analyticsService');

// @route POST /api/location
// Body: { latitude, longitude, save: boolean }
// Location is only ever sent to the backend after the user explicitly
// clicks "Detect My Location" on the frontend (see LocationDetector.jsx).
exports.detectLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, save } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required.' });
    }

    let district = null;

    if (process.env.GEOCODING_API_KEY) {
      // Placeholder integration point for a real reverse-geocoding provider.
      // Keeping the API key server-side only, never exposed to the frontend.
      // Example (pseudo):
      // const resp = await fetch(`https://api.provider.com/reverse?lat=${latitude}&lon=${longitude}&key=${process.env.GEOCODING_API_KEY}`);
      // district = (await resp.json()).district;
      district = estimateDistrict(Number(latitude), Number(longitude));
    } else {
      district = estimateDistrict(Number(latitude), Number(longitude));
    }

    if (save && req.user) {
      await LocationHistory.create({
        userId: req.user._id,
        latitude,
        longitude,
        district
      });
    }

    let insight = null;
    if (district) {
      const records = await AgriculturalData.find({ district: new RegExp(`^${district}$`, 'i') });
      if (records.length) {
        const rainfall = records.map((r) => r.rainfall).filter((v) => typeof v === 'number');
        insight = generateInsight({ district, avgRainfall: average(rainfall) });
      }
    }

    res.json({
      success: true,
      currentLocation: { latitude, longitude },
      detectedDistrict: district,
      locationStatus: district ? 'Detected' : 'District could not be determined from coordinates',
      insight
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/location/insights/:district
exports.getLocationInsights = async (req, res, next) => {
  try {
    const { district } = req.params;
    const records = await AgriculturalData.find({ district: new RegExp(`^${district}$`, 'i') });

    if (!records.length) {
      return res.json({ success: true, district, message: 'No historical agricultural data available for this district yet.' });
    }

    const rainfall = records.map((r) => r.rainfall).filter((v) => typeof v === 'number');
    const yields = records.map((r) => r.yield).filter((v) => typeof v === 'number');
    const crops = [...new Set(records.map((r) => r.crop))];

    res.json({
      success: true,
      district,
      averageRainfall: round(average(rainfall)),
      historicalCropYield: round(average(yields)),
      majorCrops: crops,
      recordCount: records.length,
      insight: generateInsight({ district, avgRainfall: average(rainfall) })
    });
  } catch (err) {
    next(err);
  }
};
