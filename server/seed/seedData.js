/**
 * Seed script - loads DEMO/SEED agricultural data plus a default admin
 * account so the app can be explored immediately after setup.
 *
 * Usage:  npm run seed
 *
 * All records inserted here are clearly demo data (source: "Seed/Demo Dataset")
 * and are NOT machine-learning generated - they are illustrative historical
 * figures for Tamil Nadu districts used for a college-project demonstration.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const AgriculturalData = require('../models/AgriculturalData');
const WaterResource = require('../models/WaterResource');

const DISTRICTS = ['Coimbatore', 'Erode', 'Salem', 'Madurai', 'Thanjavur', 'Tiruchirappalli'];
const CROPS = ['Rice', 'Sugarcane', 'Cotton', 'Maize', 'Groundnut', 'Turmeric', 'Banana'];
const SEASONS = ['Kharif', 'Rabi', 'Whole Year'];
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024];

const SOIL_TYPES = ['Red Soil', 'Black Soil', 'Alluvial Soil', 'Clay Loam', 'Sandy Loam'];

function randomBetween(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

function buildDemoRecords() {
  const records = [];

  DISTRICTS.forEach((district) => {
    // Give each district a slightly different baseline so filters/insights feel realistic
    const baseRainfall = randomBetween(650, 950);
    const baseYield = randomBetween(2.2, 4.5);

    YEARS.forEach((year, yearIdx) => {
      CROPS.forEach((crop, cropIdx) => {
        // Not every crop appears in every district/year - keeps data realistic
        if ((cropIdx + yearIdx) % 3 === 0) return;

        const rainfall = +(baseRainfall + randomBetween(-80, 80) + yearIdx * 5).toFixed(1);
        const temperature = +randomBetween(24, 34).toFixed(1);
        const humidity = +randomBetween(55, 85).toFixed(1);
        const area = +randomBetween(500, 5000).toFixed(0);
        const yieldPerHectare = +(baseYield + randomBetween(-0.6, 0.6)).toFixed(2);
        const production = +(area * yieldPerHectare).toFixed(0);

        records.push({
          year,
          state: 'Tamil Nadu',
          district,
          crop,
          season: SEASONS[(cropIdx + yearIdx) % SEASONS.length],
          rainfall,
          temperature,
          humidity,
          soilType: SOIL_TYPES[(cropIdx + yearIdx) % SOIL_TYPES.length],
          nitrogen: +randomBetween(30, 90).toFixed(1),
          phosphorus: +randomBetween(15, 55).toFixed(1),
          potassium: +randomBetween(25, 65).toFixed(1),
          ph: +randomBetween(5.5, 8.0).toFixed(1),
          area,
          production,
          yield: yieldPerHectare,
          source: 'Seed/Demo Dataset'
        });
      });
    });
  });

  return records;
}

// Rivers/ponds/lakes/reservoirs + seasonal water storage per district.
// Storage % is a simple capacity-vs-actual calculation - an Analytics-Based
// Estimate, never a machine-learning prediction.
function buildWaterResourceRecords() {
  const records = [];

  DISTRICTS.forEach((district) => {
    const baseCapacity = randomBetween(80, 220); // Million Cubic Meters (MCM)

    YEARS.forEach((year) => {
      ['Rainy/Monsoon', 'Summer', 'Winter'].forEach((season) => {
        const fillFactor =
          season === 'Rainy/Monsoon' ? randomBetween(0.65, 0.95)
          : season === 'Winter' ? randomBetween(0.4, 0.65)
          : randomBetween(0.15, 0.4);

        records.push({
          state: 'Tamil Nadu',
          district,
          year,
          season,
          riverCount: Math.floor(randomBetween(1, 5)),
          pondCount: Math.floor(randomBetween(20, 120)),
          lakeCount: Math.floor(randomBetween(2, 15)),
          reservoirCount: Math.floor(randomBetween(1, 6)),
          totalStorageCapacityMCM: +baseCapacity.toFixed(1),
          currentStorageMCM: +(baseCapacity * fillFactor).toFixed(1),
          rainfallMM: season === 'Rainy/Monsoon' ? randomBetween(700, 1100) : randomBetween(50, 300),
          source: 'Seed/Demo Dataset'
        });
      });
    });
  });

  return records;
}

async function seed() {
  await connectDB();

  console.log('Seeding DEMO/SEED data. Existing demo/admin data will be refreshed...');

  // Admin account
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@agriai.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: 'Platform Admin',
      email: adminEmail,
      mobile: '9999999999',
      password: hashed,
      role: 'admin',
      state: 'Tamil Nadu',
      district: undefined,
      language: 'English',
      userType: 'Government Official'
    });
    console.log(`Admin account created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin account already exists: ${adminEmail}`);
  }

  // Demo agricultural data - only seed if empty, to avoid duplicating on repeat runs
  const existingDemoCount = await AgriculturalData.countDocuments({ source: 'Seed/Demo Dataset' });
  if (existingDemoCount === 0) {
    const records = buildDemoRecords();
    await AgriculturalData.insertMany(records);
    console.log(`Inserted ${records.length} DEMO/SEED agricultural records across ${DISTRICTS.length} districts.`);
  } else {
    console.log(`Demo agricultural data already present (${existingDemoCount} records). Skipping insert.`);
    console.log('Delete records with source "Seed/Demo Dataset" first if you want to re-seed.');
  }

  // Demo water resource data - rivers/ponds/lakes/reservoirs + seasonal storage
  const existingWaterCount = await WaterResource.countDocuments({ source: 'Seed/Demo Dataset' });
  if (existingWaterCount === 0) {
    const waterRecords = buildWaterResourceRecords();
    await WaterResource.insertMany(waterRecords);
    console.log(`Inserted ${waterRecords.length} DEMO/SEED water resource records across ${DISTRICTS.length} districts.`);
  } else {
    console.log(`Demo water resource data already present (${existingWaterCount} records). Skipping insert.`);
  }

  console.log('Seeding complete.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
