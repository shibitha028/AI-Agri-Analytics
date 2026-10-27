const fs = require('fs');
const AgriculturalData = require('../models/AgriculturalData');
const UploadHistory = require('../models/UploadHistory');
const User = require('../models/User');
const { parseFile, validateDataset } = require('../services/excelService');

// In-memory holding area for "preview" stage before import confirmation.
// Keyed by uploadHistory ID. For a college-project scale app this is fine;
// for production, this would move to a persistent staging collection.
const previewCache = new Map();

// @route POST /api/admin/upload
exports.uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload.' });
    }

    const rows = await parseFile(req.file.path);
    const { totalRows, validRows, invalidRows, validCount, invalidCount } = validateDataset(rows);

    const uploadHistory = await UploadHistory.create({
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
      totalRecords: totalRows,
      validRecords: validCount,
      invalidRecords: invalidCount,
      status: 'validated',
      validationErrors: invalidRows.slice(0, 100).map((r) => ({ row: r.row, reason: r.reasons.join(', ') }))
    });

    previewCache.set(String(uploadHistory._id), { validRows, filePath: req.file.path });

    res.json({
      success: true,
      message: 'Dataset uploaded and validated successfully.',
      uploadId: uploadHistory._id,
      totalRows,
      validRows: validCount,
      invalidRows: invalidCount,
      preview: {
        valid: validRows.slice(0, 20),
        invalid: invalidRows.slice(0, 20)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/admin/import
exports.importDataset = async (req, res, next) => {
  try {
    const { uploadId } = req.body;
    if (!uploadId) {
      return res.status(400).json({ success: false, message: 'uploadId is required.' });
    }

    const cached = previewCache.get(String(uploadId));
    if (!cached) {
      return res.status(400).json({ success: false, message: 'No pending preview found for this upload. Please re-upload the file.' });
    }

    const docs = cached.validRows.map((row) => ({
      year: row.year,
      state: row.state || 'Tamil Nadu',
      district: row.district,
      crop: row.crop,
      season: row.season || 'Whole Year',
      rainfall: row.rainfall,
      temperature: row.temperature,
      humidity: row.humidity,
      soilType: row.soiltype || row.soil_type,
      nitrogen: row.nitrogen,
      phosphorus: row.phosphorus,
      potassium: row.potassium,
      ph: row.ph,
      area: row.area,
      production: row.production,
      yield: row.yield,
      source: 'Admin Upload'
    }));

    if (docs.length) {
      await AgriculturalData.insertMany(docs, { ordered: false });
    }

    await UploadHistory.findOneAndUpdate({ _id: uploadId }, { status: 'imported' });

    previewCache.delete(String(uploadId));
    if (cached.filePath && fs.existsSync(cached.filePath)) {
      fs.unlink(cached.filePath, () => {});
    }

    res.json({ success: true, message: `${docs.length} valid records imported successfully.`, importedCount: docs.length });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/uploads
exports.getUploadHistory = async (req, res, next) => {
  try {
    const uploads = await UploadHistory.find().populate('uploadedBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: uploads.length, data: uploads });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/dashboard (admin dashboard cards)
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalRecords, districts, crops, totalDatasets] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      AgriculturalData.countDocuments(),
      AgriculturalData.distinct('district'),
      AgriculturalData.distinct('crop'),
      UploadHistory.countDocuments()
    ]);

    res.json({
      success: true,
      cards: {
        totalUsers,
        totalRecords,
        totalDistricts: districts.length,
        totalCrops: crops.length,
        totalDatasets,
        systemStatus: 'Operational'
      }
    });
  } catch (err) {
    next(err);
  }
};
