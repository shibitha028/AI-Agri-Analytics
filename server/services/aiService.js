/**
 * AI Farming Assistant service.
 *
 * If ANTHROPIC_API_KEY is set in .env, natural-language questions are sent
 * to the Anthropic API together with real, retrieved agricultural context
 * from MongoDB so answers stay grounded in actual data.
 *
 * If no API key is configured, a transparent rule-based fallback answers
 * common question patterns using the same MongoDB-derived data. The app
 * MUST work fully without any AI API key.
 */

const AgriculturalData = require('../models/AgriculturalData');
const { average, round } = require('./analyticsService');

const hasAIKey = () => Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim().length > 0);

async function fetchContextForDistrict(district) {
  if (!district) return null;
  const records = await AgriculturalData.find({ district: new RegExp(`^${district}$`, 'i') }).limit(200);
  if (!records.length) return null;

  const rainfall = records.map((r) => r.rainfall).filter((v) => typeof v === 'number');
  const yields = records.map((r) => r.yield).filter((v) => typeof v === 'number');
  const crops = [...new Set(records.map((r) => r.crop))];
  const years = [...new Set(records.map((r) => r.year))].sort();

  return {
    district,
    recordCount: records.length,
    avgRainfall: round(average(rainfall)),
    avgYield: round(average(yields)),
    crops,
    years
  };
}

function extractDistrictFromQuestion(question, knownDistricts) {
  const lower = question.toLowerCase();
  return knownDistricts.find((d) => lower.includes(d.toLowerCase()));
}

async function ruleBasedAnswer(question, context) {
  const lower = question.toLowerCase();

  if (!context) {
    return `I don't have historical records for that district yet in the database. Try asking about a district with uploaded data, such as Coimbatore, Erode, Salem, Madurai, Thanjavur, or Tiruchirappalli.`;
  }

  if (lower.includes('rainfall')) {
    return `Based on ${context.recordCount} historical records for ${context.district}, the average recorded rainfall is approximately ${context.avgRainfall} mm across ${context.years.join(', ')}.`;
  }

  if (lower.includes('crop')) {
    return `Historical records for ${context.district} include the following crops: ${context.crops.join(', ')}.`;
  }

  if (lower.includes('yield') || lower.includes('production')) {
    return `The average historical yield recorded for ${context.district} is approximately ${context.avgYield} tonnes/hectare, based on ${context.recordCount} records. This is a historical average, not a prediction.`;
  }

  if (lower.includes('why') && lower.includes('rainfall')) {
    return `Rainfall directly affects soil moisture, crop growth stages, and irrigation needs. Consistent, well-timed rainfall generally supports healthier yields, while extreme deficits or excess can stress crops.`;
  }

  return `For ${context.district}, there are ${context.recordCount} historical records covering crops like ${context.crops.slice(0, 3).join(', ')}, with average rainfall of ${context.avgRainfall} mm and average yield of ${context.avgYield} tonnes/hectare. Ask me about rainfall trends, crops, or yield for more specific details.`;
}

async function askAssistant(question, knownDistricts = []) {
  const district = extractDistrictFromQuestion(question, knownDistricts);
  const context = await fetchContextForDistrict(district);

  if (!hasAIKey()) {
    const answer = await ruleBasedAnswer(question, context);
    return { answer, source: 'rule-based-fallback', usedAI: false };
  }

  try {
    const systemPrompt = `You are an agricultural data assistant for an Indian analytics platform. ` +
      `Only use the historical data context provided below - do not fabricate numbers or make ML-style yield predictions. ` +
      `If asked for a prediction, clearly say your answer is an analytics-based estimate derived from historical averages, not a machine learning forecast. ` +
      `Context: ${context ? JSON.stringify(context) : 'No historical data available for the mentioned district.'}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }]
      })
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status ${response.status}`);
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((c) => c.type === 'text');
    const answer = textBlock ? textBlock.text : await ruleBasedAnswer(question, context);

    return { answer, source: 'anthropic-api', usedAI: true };
  } catch (err) {
    console.error('AI service error, falling back to rule-based response:', err.message);
    const answer = await ruleBasedAnswer(question, context);
    return { answer, source: 'rule-based-fallback (AI error)', usedAI: false };
  }
}

module.exports = { askAssistant, fetchContextForDistrict, hasAIKey };
