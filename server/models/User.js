const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    state: { type: String, default: 'Tamil Nadu' },
    district: { type: String, required: function () { return this.role === 'user'; } },
    village: { type: String },
    language: { type: String, default: 'English' },
    userType: {
      type: String,
      enum: ['Farmer', 'Researcher', 'Student', 'Government Official', 'Other'],
      default: 'Farmer'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
