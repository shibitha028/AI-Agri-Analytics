const mongoose = require('mongoose');

const UploadHistorySchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalRecords: { type: Number, default: 0 },
    validRecords: { type: Number, default: 0 },
    invalidRecords: { type: Number, default: 0 },
    uploadDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'validated', 'imported', 'failed'], default: 'pending' },
    validationErrors: [{ row: Number, reason: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('UploadHistory', UploadHistorySchema);
