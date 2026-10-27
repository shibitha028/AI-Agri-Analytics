/**
 * Rule-based / statistical analytics service.
 *
 * IMPORTANT: This project intentionally does NOT use machine learning.
 * All "predictions" here are transparent arithmetic (averages, trend deltas,
 * percentage scenario adjustments) derived from historical MongoDB records.
 * Results are always labeled "Analytics-Based Estimate" or
 * "Scenario Simulation" - never as ML output, and no confidence scores
 * are fabricated.
 */

const average = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

const round = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(num)) return 0;
  const factor = 10 ** decimals;
  return Math.round(num * factor) / factor;
};

/**
 * Analytics-Based Soil Health Score (0-100).
 * Simple weighted rule-based scoring against agronomically reasonable
 * reference ranges. This is explicitly NOT a machine learning prediction.
 */
function calculateSoilHealthScore({ nitrogen, phosphorus, potassium, ph }) {
  const scoreInRange = (value, min, max) => {
    if (value === undefined || value === null || isNaN(value)) return 50; // neutral default
    if (value >= min && value <= max) return 100;
    const distance = value < min ? min - value : value - max;
    const range = max - min || 1;
    return Math.max(0, 100 - (distance / range) * 100);
  };

  const nScore = scoreInRange(nitrogen, 40, 80);
  const pScore = scoreInRange(phosphorus, 20, 50);
  const kScore = scoreInRange(potassium, 30, 60);
  const phScore = scoreInRange(ph, 6.0, 7.5);

  const weighted = nScore * 0.3 + pScore * 0.25 + kScore * 0.25 + phScore * 0.2;
  return Math.round(weighted);
}

/**
 * Scenario Simulation: rule-based "what-if" adjustment of historical yield
 * based on percentage/degree changes to rainfall, temperature and humidity.
 * Uses simple, transparent sensitivity coefficients - clearly not an ML model.
 */
function simulateScenario({ baselineYield, rainfallChangePercent = 0, temperatureChangeC = 0, humidityChangePercent = 0 }) {
  // Transparent, documented sensitivity assumptions (agronomic rules of thumb):
  const RAINFALL_SENSITIVITY = 0.004;   // +1% rainfall -> ~0.4% yield change (diminishing beyond thresholds ignored for simplicity)
  const TEMPERATURE_SENSITIVITY = -0.03; // +1°C -> ~3% yield decrease (heat stress assumption)
  const HUMIDITY_SENSITIVITY = 0.0015;  // +1% humidity -> ~0.15% yield change

  const rainfallEffect = rainfallChangePercent * RAINFALL_SENSITIVITY;
  const temperatureEffect = temperatureChangeC * TEMPERATURE_SENSITIVITY;
  const humidityEffect = humidityChangePercent * HUMIDITY_SENSITIVITY;

  const totalEffect = rainfallEffect + temperatureEffect + humidityEffect;
  const estimatedYield = baselineYield * (1 + totalEffect);
  const difference = estimatedYield - baselineYield;

  let riskLevel = 'Low';
  if (totalEffect <= -0.15) riskLevel = 'High';
  else if (totalEffect <= -0.05) riskLevel = 'Moderate';

  return {
    currentValue: round(baselineYield),
    simulatedValue: round(estimatedYield),
    difference: round(difference),
    percentChange: round(totalEffect * 100),
    riskLevel,
    resultType: 'Scenario Simulation'
  };
}

/**
 * Generates a short, factual natural-language insight strictly from
 * aggregated historical data (no fabrication, no invented numbers).
 */
function generateInsight({ district, avgRainfall, prevAvgRainfall, avgYield, prevAvgYield, topCrop }) {
  const parts = [];

  if (avgRainfall !== undefined && prevAvgRainfall !== undefined && prevAvgRainfall > 0) {
    const trend = avgRainfall > prevAvgRainfall ? 'higher' : avgRainfall < prevAvgRainfall ? 'lower' : 'similar';
    parts.push(`Based on available historical data, ${district} recorded ${trend} rainfall compared with the previous period.`);
  } else if (avgRainfall !== undefined) {
    parts.push(`Based on available historical data, ${district} has an average recorded rainfall of ${round(avgRainfall)} mm.`);
  }

  if (avgYield !== undefined && prevAvgYield !== undefined && prevAvgYield > 0) {
    const trend = avgYield > prevAvgYield ? 'an increase' : avgYield < prevAvgYield ? 'a decrease' : 'no significant change';
    parts.push(`Historical yield data shows ${trend} compared with the previous recorded period.`);
  }

  if (topCrop) {
    parts.push(`${topCrop} appears most frequently among the historical crop records for this district.`);
  }

  if (parts.length === 0) {
    parts.push(`No sufficient historical data is currently available for ${district}. Please check back after more records are added.`);
  }

  return parts.join(' ');
}

module.exports = {
  average,
  round,
  calculateSoilHealthScore,
  simulateScenario,
  generateInsight
};
