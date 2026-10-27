const mongoose = require('mongoose');

const AgriculturalDataSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true, index: true },
    crop: { type: String, required: true, trim: true },
    season: { type: String, enum: ['Kharif', 'Rabi', 'Whole Year', 'Summer', 'Winter'], default: 'Whole Year' },
    rainfall: { type: Number, required: true }, // mm
    temperature: { type: Number }, // Celsius
    humidity: { type: Number }, // %
    soilType: { type: String },
    nitrogen: { type: Number }, // N (kg/ha or index)
    phosphorus: { type: Number }, // P
    potassium: { type: Number }, // K
    ph: { type: Number },
    area: { type: Number }, // hectares
    production: { type: Number }, // tonnes
    yield: { type: Number }, // tonnes/hectare - HISTORICAL, never model-predicted
    source: { type: String, default: 'Seed/Demo Dataset' }
  },
  { timestamps: true }
);

AgriculturalDataSchema.index({ district: 1, crop: 1, year: 1 });

module.exports = mongoose.model('AgriculturalData', AgriculturalDataSchema);
