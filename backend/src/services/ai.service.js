/**
 * AI Service for Smart Uzhavan Backend.
 * Handles AI Agricultural Assistant, Crop Health Analysis, Irrigation Planning,
 * and Yield Prediction using Google Gemini API with agronomic fallback models.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Checks if a real Gemini API Key is configured in environment variables.
 * Ensures placeholder values are not treated as active credentials.
 */
export const isGeminiConfigured = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes('your_gemini_api_key_here') || key.trim() === '') {
    return false;
  }
  return true;
};

/**
 * System instruction tailored for South Indian & Tamil Nadu agronomy.
 */
const AGRI_SYSTEM_PROMPT = `
You are the Smart Uzhavan AI Agricultural Assistant, an expert agronomist specialized in South Indian / Tamil Nadu agriculture, organic farming, pest management, crop health, weather advisories, irrigation, and government agricultural schemes (PM-KISAN, Kalaignar Scheme, crop insurance).
Respond accurately, concisely, and practically.
Support both Tamil and English depending on user request.
Always include practical steps and eco-friendly or IPM (Integrated Pest Management) options where relevant.
Clearly state that advice is for guidance and to verify with local Agricultural Extension Officers for high-risk chemical treatments.
`;

/**
 * Chat with AI Agricultural Assistant.
 */
export const chatWithAssistant = async ({ message, history = [], language = 'en' }) => {
  if (!message || message.trim() === '') {
    throw new Error('Message cannot be empty.');
  }

  const configured = isGeminiConfigured();

  if (configured) {
    try {
      const apiKey = process.env.GEMINI_API_KEY.trim();
      const contents = [];

      // Format previous conversation history if provided
      if (Array.isArray(history) && history.length > 0) {
        history.forEach((h) => {
          if (h.role && h.text) {
            contents.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }],
            });
          }
        });
      }

      // Add current message
      const promptText = language === 'ta'
        ? `[Language: Tamil / தமிழ்]\n${message}`
        : message;

      contents.push({
        role: 'user',
        parts: [{ text: promptText }],
      });

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: AGRI_SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('[ai.service] Gemini API returned error:', errorData);
        throw new Error(errorData?.error?.message || `Gemini API error status: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        throw new Error('No response text received from Gemini API.');
      }

      return {
        reply,
        configured: true,
        source: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[ai.service] Gemini invocation failed, providing agronomic fallback:', err.message);
      // Fallback if network or quota issue occurs
    }
  }

  // Fallback agronomic advisory when Gemini is not configured or temporarily unavailable
  const fallbackReply = getAgronomicFallbackReply(message, language);
  return {
    reply: fallbackReply,
    configured: false,
    source: 'agronomy-knowledge-base',
    disclaimer: 'Live Gemini API is not configured on the backend. Add GEMINI_API_KEY to backend .env for generative responses.',
    timestamp: new Date().toISOString(),
  };
};

/**
 * Crop Health & Plant Disease Image Analysis.
 */
export const analyzeCropHealth = async ({ imageBase64, mimeType = 'image/jpeg', cropName = '', language = 'en' }) => {
  const configured = isGeminiConfigured();

  if (configured && imageBase64) {
    try {
      const apiKey = process.env.GEMINI_API_KEY.trim();
      const prompt = `Analyze this crop/plant leaf image${cropName ? ` for crop: ${cropName}` : ''}.
Identify any disease, pest, nutrient deficiency, or fungal infection.
Respond strictly in valid JSON matching this schema:
{
  "crop": "Crop name",
  "detectedIssue": "Name of disease or pest",
  "severity": "Low" | "Medium" | "High",
  "confidence": "e.g. 88%",
  "symptoms": ["symptom 1", "symptom 2"],
  "causes": ["cause 1", "cause 2"],
  "recommendedTreatment": ["organic/IPM step", "approved chemical control"],
  "preventiveMeasures": ["preventive measure 1", "preventive measure 2"]
}`;

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            response_mime_type: 'application/json',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return {
            ...parsed,
            configured: true,
            source: 'gemini-1.5-flash-vision',
            isInformationalNotice: true,
            disclaimer: 'Informational AI guidance only. Confirm with local KVK before chemical spraying.',
          };
        }
      }
    } catch (err) {
      console.warn('[ai.service] Gemini Vision failed, providing agronomic protocol:', err.message);
    }
  }

  // Domain agronomic protocol response
  return getCropHealthProtocol(cropName, language);
};

/**
 * Smart Irrigation Calculation and Advisory.
 */
export const calculateIrrigationPlan = ({ crop = 'Tomato', soilType = 'Loamy', fieldSize = 1, growthStage = 'Vegetative', language = 'en' }) => {
  const size = Math.max(0.1, parseFloat(fieldSize) || 1);

  // Crop water consumption coefficients (litres per acre per day baseline)
  const cropWaterRates = {
    Paddy: 35000,
    Sugarcane: 28000,
    Banana: 22000,
    Cotton: 14000,
    Tomato: 10000,
    Chilli: 9000,
    Brinjal: 9500,
    Groundnut: 8000,
    Onion: 8500,
  };

  // Soil retention multipliers & interval adjustment
  const soilFactors = {
    Sandy: { factor: 1.25, intervalDays: 1, method: 'Drip Irrigation (Frequent cycles)', retention: 'Low' },
    Loamy: { factor: 1.0, intervalDays: 2, method: 'Drip or Furrow Irrigation', retention: 'Optimal' },
    Clay: { factor: 0.85, intervalDays: 3, method: 'Broad Bed & Furrow / Controlled Drip', retention: 'High' },
    Silt: { factor: 0.95, intervalDays: 2, method: 'Drip Irrigation', retention: 'Moderate' },
  };

  const baseRate = cropWaterRates[crop] || 10000;
  const soilInfo = soilFactors[soilType] || soilFactors.Loamy;
  const dailyRequirementLitres = Math.round(baseRate * soilInfo.factor * size);

  const isTa = language === 'ta';

  return {
    crop,
    soilType,
    fieldSize: size,
    growthStage,
    dailyWaterRequirement: `${dailyRequirementLitres.toLocaleString()} Litres`,
    recommendedInterval: isTa
      ? `${soilInfo.intervalDays} நாட்களுக்கு ஒரு முறை`
      : `Every ${soilInfo.intervalDays} day${soilInfo.intervalDays > 1 ? 's' : ''}`,
    recommendedMethod: soilInfo.method,
    soilRetention: soilInfo.retention,
    conservationTip: isTa
      ? 'டிரிப் மற்றும் மல்சிங் பாசனம் மூலம் 40% வரை நீர் மிச்சப்படுத்தலாம். காலை 6-9 மணி அல்லது மாலை 5 மணிக்கு நீர் பாய்ச்சவும்.'
      : 'Adopt drip irrigation and soil mulching to conserve up to 40% water. Irrigate early morning (6-9 AM) or late evening to minimize evaporation.',
    timestamp: new Date().toISOString(),
  };
};

/**
 * Agronomic Yield Prediction based on TNAU benchmarks.
 */
export const calculateYieldPrediction = ({ crop = 'Paddy', landSize = 1, soilType = 'Clay', fertilizerUsage = 'Medium', season = 'Kharif', language = 'en' }) => {
  const size = Math.max(0.1, parseFloat(landSize) || 1);

  // Baseline average yield in Metric Tons per Acre in Tamil Nadu
  const baselineYields = {
    Paddy: 2.4, // ~2.4 tons per acre (6 tons/ha)
    Sugarcane: 40.0, // ~40 tons per acre
    Banana: 18.0,
    Tomato: 12.0,
    Cotton: 1.1,
    Groundnut: 1.2,
    Chilli: 4.5,
    Onion: 7.0,
  };

  const fertMultiplier = {
    Low: 0.85,
    Medium: 1.0,
    High: 1.15,
  }[fertilizerUsage] || 1.0;

  const soilMultiplier = {
    Clay: crop === 'Paddy' ? 1.1 : 0.95,
    Loamy: 1.05,
    Sandy: 0.85,
  }[soilType] || 1.0;

  const base = baselineYields[crop] || 2.0;
  const estimatedTons = (base * fertMultiplier * soilMultiplier * size).toFixed(1);
  const minTons = (parseFloat(estimatedTons) * 0.9).toFixed(1);
  const maxTons = (parseFloat(estimatedTons) * 1.1).toFixed(1);

  const isTa = language === 'ta';

  return {
    crop,
    landSize: size,
    soilType,
    fertilizerUsage,
    season,
    estimatedYield: `${estimatedTons} Metric Tons`,
    estimatedYieldRange: `${minTons} - ${maxTons} Metric Tons`,
    expectedMarketDemand: isTa ? 'நடுத்தரம் முதல் அதிகம்' : 'Medium to High',
    suggestedHarvestWindow: isTa ? '3 - 4 வாரங்கள்' : '3 - 4 Weeks',
    disclaimer: isTa
      ? 'குறிப்பு: விளைச்சல் கணிப்பு பிராந்திய வேளாண் சராசரியை அடிப்படையாகக் கொண்டது, உத்தரவாதம் அல்ல.'
      : 'Disclaimer: Yield estimation is based on regional agronomy averages and weather conditions, not a guaranteed harvest.',
    timestamp: new Date().toISOString(),
  };
};

/**
 * Multi-Crop Recommendations based on agronomy parameters.
 */
export const getCropRecommendations = ({ soilType = 'Red Soil', waterAvailability = 'Medium', season = 'Kharif', farmingType = 'Open Field', language = 'en' }) => {
  const isTa = language === 'ta';
  const recommendations = [];

  if (soilType.includes('Red') && waterAvailability === 'Medium') {
    recommendations.push({
      crop: isTa ? 'வேர்க்கடலை (நிலக்கடலை)' : 'Groundnut',
      reason: isTa ? 'நன்கு வடிகால் உள்ள சிவப்பு மண்ணில் மிகச்சிறந்த விளைச்சல் தரும்.' : 'Performs exceptionally well in well-drained red loamy soils.',
      fertilizer: isTa ? '20:40:40 NPK + பூக்கும் போது ஜிப்சம் 200 கிலோ/ஏக்கர்.' : '20:40:40 NPK + Gypsum 200 kg/acre at 40-45 DAS.',
      practice: isTa ? '25-30 செ.மீ வரிசை இடைவெளியில் விதைக்கவும்.' : 'Maintain 25-30 cm line spacing and seed treatment with Trichoderma.',
    });
    recommendations.push({
      crop: isTa ? 'கம்பு / தினை (சிறுதானியங்கள்)' : 'Millets (Pearl / Foxtail)',
      reason: isTa ? 'வறட்சியைத் தாங்கும், குறைந்த நீர் தேவை கொண்ட பயிர்.' : 'Drought-tolerant and suited for moderate rainfall areas.',
      fertilizer: isTa ? '40:20:20 NPK + மக்கிய எரு உரம்.' : '40:20:20 NPK + 5 tons Farm Yard Manure.',
      practice: isTa ? 'வரி விதைப்பு செய்து களையெடுக்க வசதியாக வைக்கவும்.' : 'Line sowing facilitates mechanical weeding and higher yield.',
    });
  }

  if (soilType.includes('Clay') && waterAvailability !== 'Low') {
    recommendations.push({
      crop: isTa ? 'நெல் (பயிர் வகை)' : 'Paddy (Rice)',
      reason: isTa ? 'களிமண் நீரை தேக்கி வைக்கும் தன்மை கொண்டது, நெல்லுக்கு உகந்தது.' : 'Clay soil holds moisture effectively, optimal for paddy cultivation.',
      fertilizer: isTa ? '100:50:50 NPK 3 தவணைகளாக பிரித்து இடவும்.' : '100:50:50 NPK split across basal, tillering, and panicle initiation.',
      practice: isTa ? 'நீர் சிக்கனத்திற்கு மாற்று முறை பாசனம் (AWD) பின்பற்றவும்.' : 'Adopt Alternate Wetting and Drying (AWD) for water saving.',
    });
  }

  if (farmingType === 'Organic') {
    recommendations.push({
      crop: isTa ? 'காய்கறிகள் (தக்காளி / கத்தரி / மிளகாய்)' : 'Vegetables (Tomato / Brinjal / Chilli)',
      reason: isTa ? 'இயற்கை முறையில் விளைவிக்கப்படும் காய்கறிகளுக்கு அதிக சந்தை மதிப்பு உள்ளது.' : 'High consumer premium for certified organic horticultural produce.',
      fertilizer: isTa ? 'மண்புழு உரம், பஞ்சகவ்யா மற்றும் ஜீவாமிர்தம் பயன்படுத்தவும்.' : 'Vermicompost, Panchagavya spray, and Jeevamrutham application.',
      practice: isTa ? 'மஞ்சள் வண்ண ஒட்டுப்பொறி மற்றும் இனக்கவர்ச்சி பொறிகளை வைக்கவும்.' : 'Install yellow sticky traps and pheromone traps for pest monitoring.',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      crop: isTa ? 'தக்காளி / வெண்டை / மிளகாய்' : 'Tomato / Okra / Chilli',
      reason: isTa ? 'சரியான வடிகால் மற்றும் நடுத்தர நீரில் அனைத்து மண்ணிலும் வளரக்கூடியது.' : 'Broadly adapted with proper drainage and balanced irrigation.',
      fertilizer: isTa ? 'அடிப்படை உரமாக எரு + 75:50:50 NPK 3 பிரிவாக இடவும்.' : 'Basal FYM + 75:50:50 NPK in 3 splits with micronutrient spray.',
      practice: isTa ? 'டிரிப் பாசனம் மற்றும் மல்சிங் மூலம் சிறந்த லாபம் ஈட்டலாம்.' : 'Drip irrigation with silver-black mulch sheet maximizes yield.',
    });
  }

  return {
    filters: { soilType, waterAvailability, season, farmingType },
    recommendations,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Domain Agronomic Knowledge Base Fallback Replies.
 */
function getAgronomicFallbackReply(message, language) {
  const query = message.toLowerCase();
  const isTa = language === 'ta';

  if (query.includes('paddy') || query.includes('நெல்')) {
    return isTa
      ? 'நெல் பயிரில் தழைச்சத்து, மணிச்சத்து, சாம்பல்சத்தை 100:50:50 என்ற விகிதத்தில் இடவும். அசோஸ்பைரில்லம் மற்றும் பாஸ்போபாக்டீரியா இடுவதன் மூலம் 25% ரசாயன உரத்தை குறைக்கலாம்.'
      : 'For Paddy cultivation, recommended NPK ratio is 100:50:50 kg/acre in 3 splits. Applying Azospirillum and Phosphobacteria reduces synthetic nitrogen requirement by 25%.';
  }

  if (query.includes('tomato') || query.includes('தக்காளி') || query.includes('blight') || query.includes('கருகல்')) {
    return isTa
      ? 'தக்காளி இலைக்கருகல் நோய்க்கு சூடோமோனாஸ் புளோரசன்ஸ் (5 கிராம்/லிட்டர்) தெளிக்கவும். பூஞ்சை தீவிரமாக இருந்தால் மான்கோசெப் (2 கிராம்/லிட்டர்) தெளிக்கலாம்.'
      : 'For Tomato Leaf Blight, apply Pseudomonas fluorescens (5g/L) as a prophylactic biocontrol. For severe infection, spray Mancozeb @ 2g/litre within 2 days.';
  }

  if (query.includes('irrigation') || query.includes('பாசனம்') || query.includes('water') || query.includes('தண்ணீர்')) {
    return isTa
      ? 'சொட்டு நீர் பாசனம் (Drip Irrigation) மூலம் 40-50% தண்ணீர் மிச்சப்படுத்தலாம். தக்காளி மற்றும் மிளகாய் பயிர்களுக்கு 2 நாட்களுக்கு ஒரு முறை காலை வேளையில் நீர் பாய்ச்சுவது சிறந்தது.'
      : 'Drip irrigation conserves 40-50% water while improving fertilizer use efficiency. Irrigate during early morning hours to minimize evaporative loss.';
  }

  return isTa
    ? 'வணக்கம்! நான் ஸ்மார்ட் உழவன் AI உதவியாளர். பயிர் ஆரோக்கியம், உரம், பூச்சி மேலாண்மை மற்றும் பாசனம் குறித்து நீங்கள் கேட்கலாம். (முழு AI திறனுக்கு backend-ல் GEMINI_API_KEY இணைக்கவும்).'
    : 'Welcome to Smart Uzhavan AI Assistant! You can ask questions about crop health, organic pest control, fertilizer schedules, and irrigation. (To enable full generative Gemini AI, configure GEMINI_API_KEY in the backend).';
}

/**
 * Protocol for crop health when Vision model is offline.
 */
function getCropHealthProtocol(cropName, language) {
  const isTa = language === 'ta';
  return {
    crop: cropName || (isTa ? 'தக்காளி / பயிர்' : 'Tomato / General Crop'),
    detectedIssue: isTa ? 'இலைக்கருகல் / பூஞ்சை தொற்று (கண்காணிப்பு நெறிமுறை)' : 'Leaf Blight / Foliar Fungal Pattern (Standard Protocol)',
    severity: 'Medium',
    confidence: 'Educational Diagnostic',
    symptoms: isTa
      ? ['இலைகளில் பழுப்பு நிற புள்ளிகள்', 'கீழ் இலைகள் மஞ்சள் நிறமாக மாறுதல்']
      : ['Concentric brown spots with yellow halos on mature leaves', 'Lower leaf chlorosis'],
    causes: isTa
      ? ['அதிக ஈரப்பதம் மற்றும் தொடர் மேகமூட்டம்', 'பூஞ்சை வித்துக்கள் பரவுதல்']
      : ['Alternaria solani fungal spores favored by humid conditions (>80% RH)', 'Poor canopy air circulation'],
    recommendedTreatment: isTa
      ? ['சூடோமோனாஸ் புளோரசன்ஸ் 5 கிராம்/லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்.', 'பாதிக்கப்பட்ட இலைகளை அகற்றி அழிக்கவும்.']
      : ['Foliar spray of Pseudomonas fluorescens @ 5g/L or Mancozeb @ 2g/L.', 'Prune and destroy infected lower foliage.'],
    preventiveMeasures: isTa
      ? ['சொட்டு நீர் பாசனம் பயன்படுத்தவும்; இலைகளில் தண்ணீர் தேங்காமல் பார்த்துக் கொள்ளவும்.', 'பயிர் சுழற்சி முறை பின்பற்றவும்.']
      : ['Adopt drip irrigation rather than overhead sprinkling.', 'Maintain crop rotation with non-solanaceous crops.'],
    configured: false,
    source: 'agronomy-diagnostic-protocol',
    isInformationalNotice: true,
    disclaimer: 'Informational AI guidance only. Configure GEMINI_API_KEY on the backend to activate direct multimodal leaf image analysis.',
  };
}

/**
 * Health status reporting for Admin telemetry
 */
export const getAiHealthStatus = () => {
  const configured = isGeminiConfigured();
  return {
    provider: 'Google Gemini API',
    model: 'gemini-1.5-flash',
    configured,
    status: configured ? 'ACTIVE' : 'FALLBACK_MODE',
    fallbackAvailable: true,
  };
};
