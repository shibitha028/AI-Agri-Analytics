const mongoose = require('mongoose');

// Tracks rivers/ponds/lakes/reservoirs and seasonal water storage for a district.
// Storage percentage is an Analytics-Based Estimate (capacity vs. actual storage),
// never a machine-learning prediction.
const waterResourceSchema = new mongoose.Schema(
  {
    state: { type: String, default: 'Tamil Nadu' },
    district: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    season: {
      type: String,
      enum: ['Rainy/Monsoon', 'Summer', 'Winter', 'Whole Year'],
      required: true
    },

    // Water body counts for this district
    riverCount: { type: Number, default: 0 },
    pondCount: { type: Number, default: 0 },
    lakeCount: { type: Number, default: 0 },
    reservoirCount: { type: Number, default: 0 },

    // Capacity & actual storage (in Million Cubic Meters - MCM)
    totalStorageCapacityMCM: { type: Number, required: true },
    currentStorageMCM: { type: Number, required: true },

    // Rainfall linked to this record, for correlation on the chart
    rainfallMM: { type: Number },

    source: { type: String, default: 'Seed/Demo Dataset' }
  },
  { timestamps: true }
);

// Virtual: storage filled as a percentage of total capacity
waterResourceSchema.virtual('storagePercentage').get(function () {
  if (!this.totalStorageCapacityMCM) return 0;
  return +((this.currentStorageMCM / this.totalStorageCapacityMCM) * 100).toFixed(1);
});

waterResourceSchema.set('toJSON', { virtuals: true });
waterResourceSchema.set('toObject', { virtuals: true });

waterResourceSchema.index({ district: 1, year: 1, season: 1 });

module.exports = mongoose.model('WaterResource', waterResourceSchema);
