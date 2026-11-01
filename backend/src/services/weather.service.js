/**
 * Weather Service for Smart Uzhavan Backend.
 * Connects to Open-Meteo API for real-time meteorological observations,
 * 7-day forecast, and agricultural spray/irrigation advisories.
 */

// Coordinates for major Tamil Nadu agricultural districts and mandis
export const TAMIL_NADU_COORDINATES = {
  Trichy: { lat: 10.7905, lon: 78.7047, nameTa: 'திருச்சி' },
  Chennai: { lat: 13.0827, lon: 80.2707, nameTa: 'சென்னை' },
  Erode: { lat: 11.3410, lon: 77.7172, nameTa: 'ஈரோடு' },
  Madurai: { lat: 9.9252, lon: 78.1198, nameTa: 'மதுரை' },
  Salem: { lat: 11.6643, lon: 78.1460, nameTa: 'சேலம்' },
  Coimbatore: { lat: 11.0168, lon: 76.9558, nameTa: 'கோயம்புத்தூர்' },
  Thanjavur: { lat: 10.7870, lon: 79.1378, nameTa: 'தஞ்சாவூர்' },
  Nagercoil: { lat: 8.1833, lon: 77.4119, nameTa: 'நாகர்கோவில்' },
};

/**
 * Maps WMO weather code to readable description, icon type, and Tamil translation.
 */
export const decodeWmoCode = (code) => {
  const codes = {
    0: { conditionEn: 'Clear Sky', conditionTa: 'தெளிவான வானம்', icon: 'weather-sunny' },
    1: { conditionEn: 'Mainly Clear', conditionTa: 'பொதுவாக தெளிவான வானம்', icon: 'weather-partly-cloudy' },
    2: { conditionEn: 'Partly Cloudy', conditionTa: 'பகுதி மேகமூட்டம்', icon: 'weather-partly-cloudy' },
    3: { conditionEn: 'Overcast', conditionTa: 'முழு மேகமூட்டம்', icon: 'weather-cloudy' },
    45: { conditionEn: 'Foggy', conditionTa: 'பனிமூட்டம்', icon: 'weather-fog' },
    48: { conditionEn: 'Depositing Rime Fog', conditionTa: 'அடர் பனி', icon: 'weather-fog' },
    51: { conditionEn: 'Light Drizzle', conditionTa: 'லேசான தூறல்', icon: 'weather-rainy' },
    53: { conditionEn: 'Moderate Drizzle', conditionTa: 'மிதமான தூறல்', icon: 'weather-rainy' },
    55: { conditionEn: 'Dense Drizzle', conditionTa: 'அடர் தூறல்', icon: 'weather-pouring' },
    61: { conditionEn: 'Slight Rain', conditionTa: 'லேசான மழை', icon: 'weather-rainy' },
    63: { conditionEn: 'Moderate Rain', conditionTa: 'மிதமான மழை', icon: 'weather-pouring' },
    65: { conditionEn: 'Heavy Rain', conditionTa: 'கடும் மழை', icon: 'weather-pouring' },
    80: { conditionEn: 'Slight Showers', conditionTa: 'லேசான சாரல் மழை', icon: 'weather-rainy' },
    81: { conditionEn: 'Moderate Showers', conditionTa: 'சாரல் மழை', icon: 'weather-pouring' },
    82: { conditionEn: 'Violent Showers', conditionTa: 'கனமழை', icon: 'weather-lightning-rainy' },
    95: { conditionEn: 'Thunderstorm', conditionTa: 'இடி மின்னலுடன் மழை', icon: 'weather-lightning' },
    96: { conditionEn: 'Thunderstorm with Hail', conditionTa: 'ஆலங்கட்டி மழை', icon: 'weather-hail' },
  };

  return codes[code] || { conditionEn: 'Partly Cloudy', conditionTa: 'மேகமூட்டம்', icon: 'weather-partly-cloudy' };
};

/**
 * Fetch live current weather and 7-day forecast from Open-Meteo.
 */
export const fetchWeatherData = async ({ lat, lon, locationName = 'Trichy' }) => {
  let targetLat = lat;
  let targetLon = lon;
  let districtName = locationName;

  if ((!targetLat || !targetLon) && TAMIL_NADU_COORDINATES[locationName]) {
    targetLat = TAMIL_NADU_COORDINATES[locationName].lat;
    targetLon = TAMIL_NADU_COORDINATES[locationName].lon;
  } else if (!targetLat || !targetLon) {
    targetLat = TAMIL_NADU_COORDINATES.Trichy.lat;
    targetLon = TAMIL_NADU_COORDINATES.Trichy.lon;
    districtName = 'Trichy';
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo API responded with status ${response.status}`);
  }

  const data = await response.json();
  const current = data.current;
  const daily = data.daily;

  const wmoInfo = decodeWmoCode(current.weather_code);

  // Generate 7-day forecast array
  const forecast = [];
  if (daily && daily.time) {
    for (let i = 0; i < daily.time.length; i++) {
      const code = daily.weather_code[i];
      const info = decodeWmoCode(code);
      const dateObj = new Date(daily.time[i]);
      const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      forecast.push({
        date: daily.time[i],
        day: dayName,
        maxTemp: Math.round(daily.temperature_2m_max[i]),
        minTemp: Math.round(daily.temperature_2m_min[i]),
        precipitationSum: daily.precipitation_sum[i],
        rainProbability: daily.precipitation_probability_max?.[i] || 0,
        conditionEn: info.conditionEn,
        conditionTa: info.conditionTa,
        icon: info.icon,
      });
    }
  }

  // Derive agricultural weather advisories
  const todayRainProb = forecast[0]?.rainProbability || 0;
  const windSpeed = current.wind_speed_10m;
  const temp = Math.round(current.temperature_2m);
  const humidity = current.relative_humidity_2m;

  const advisories = generateAgriAdvisories({
    temp,
    humidity,
    windSpeed,
    rainProbability: todayRainProb,
    weatherCode: current.weather_code,
  });

  return {
    location: districtName,
    latitude: targetLat,
    longitude: targetLon,
    source: 'Open-Meteo (Live Global Meteorological Service)',
    timestamp: current.time,
    current: {
      temperature: temp,
      apparentTemperature: Math.round(current.apparent_temperature),
      humidity,
      windSpeed,
      conditionEn: wmoInfo.conditionEn,
      conditionTa: wmoInfo.conditionTa,
      icon: wmoInfo.icon,
      precipitation: current.precipitation,
      rainProbability: todayRainProb,
    },
    forecast,
    advisories,
  };
};

/**
 * Calculates Agricultural Weather Advisories based on real meteorological parameters.
 */
function generateAgriAdvisories({ temp, humidity, windSpeed, rainProbability, weatherCode }) {
  const alerts = [];

  // Spraying Window Advisory
  if (windSpeed > 20) {
    alerts.push({
      titleEn: 'High Wind Alert – Postpone Foliar Spraying',
      titleTa: 'அதிக காற்று எச்சரிக்கை – மருந்து தெளிப்பதைத் தவிர்க்கவும்',
      detailEn: `Wind speed is ${windSpeed} km/h (>20 km/h threshold). Chemical spray drift risk is high. Postpone spraying to morning calm hours.`,
      detailTa: `காற்று வேகம் ${windSpeed} km/h ஆக உள்ளது. பூச்சிக்கொல்லி மருந்து காற்றில் வீணாகும் அபாயம் உள்ளதால் தெளிப்பை ஒத்திவைக்கவும்.`,
      severity: 'Medium',
      category: 'Spraying',
      icon: 'weather-windy',
    });
  } else if (rainProbability > 60) {
    alerts.push({
      titleEn: 'Rain Expected – Avoid Chemical Spraying',
      titleTa: 'மழை வாய்ப்பு – மருந்து தெளிப்பதைத் தவிர்க்கவும்',
      detailEn: `Rainfall probability is ${rainProbability}%. Fungicide or insecticide applications will be washed away before absorption.`,
      detailTa: `மழை பெய்ய ${rainProbability}% வாய்ப்புள்ளது. தெளிக்கும் மருந்துகள் மழை நீரில் அடித்துச் செல்லப்படலாம்.`,
      severity: 'High',
      category: 'Spraying',
      icon: 'weather-pouring',
    });
  } else {
    alerts.push({
      titleEn: 'Optimal Spraying Conditions',
      titleTa: 'மருந்து தெளிப்புக்கு ஏற்ற சிறந்த நேரம்',
      detailEn: `Mild wind (${windSpeed} km/h) and low rain probability (${rainProbability}%). Favorable window for pest management and nutrient spray.`,
      detailTa: `குறைந்த காற்று (${windSpeed} km/h) மற்றும் குறைவான மழை வாய்ப்பு. உரம் மற்றும் பூச்சி மருந்து தெளிக்க ஏற்ற சூழல்.`,
      severity: 'Low',
      category: 'Spraying',
      icon: 'check-circle-outline',
    });
  }

  // Irrigation Advisory
  if (rainProbability > 50) {
    alerts.push({
      titleEn: 'Rain Imminent – Suspend Irrigation Cycles',
      titleTa: 'மழை எதிர்பார்க்கப்படுகிறது – பாசனத்தை நிறுத்தி வைக்கவும்',
      detailEn: 'Upcoming rain will replenish root zone soil moisture. Suspend drip or canal watering to prevent root asphyxiation and save water.',
      detailTa: 'மழை பெய்ய வாய்ப்புள்ளதால் நீர் பாசனத்தை குறைத்து மழை நீரை பயன்படுத்தவும்.',
      severity: 'Medium',
      category: 'Irrigation',
      icon: 'water-off',
    });
  } else if (temp > 35) {
    alerts.push({
      titleEn: 'Elevated Temperature Advisory',
      titleTa: 'அதிக வெப்ப எச்சரிக்கை – நீர் பாய்ச்சுதல்',
      detailEn: `Temperature is ${temp}°C. Evapotranspiration is high. Irrigate during early morning (6-8 AM) or evening to prevent heat shock.`,
      detailTa: `வெப்பநிலை ${temp}°C ஆக உள்ளது. பயிர்களுக்கு காலை அல்லது மாலை வேளையில் நீர் பாய்ச்சவும்.`,
      severity: 'Medium',
      category: 'Irrigation',
      icon: 'thermometer-high',
    });
  }

  // Disease Risk
  if (humidity > 80 && temp >= 24 && temp <= 30) {
    alerts.push({
      titleEn: 'High Fungal Disease Risk (Blight / Mildew)',
      titleTa: 'பூஞ்சை நோய் பரவும் அபாயம் (இலைக்கருகல்)',
      detailEn: `Relative humidity at ${humidity}% with temperature around ${temp}°C creates conducive conditions for foliar blight. Monitor fields closely.`,
      detailTa: `அதிக ஈரப்பதம் (${humidity}%) பூஞ்சை நோய்களுக்கு உகந்தது. இலைக்கருகல் அறிகுறிகள் தென்படுகிறதா என கண்காணிக்கவும்.`,
      severity: 'High',
      category: 'Disease',
      icon: 'alert-decagram',
    });
  }

  return alerts;
}

/**
 * Health status reporting for Admin telemetry
 */
export const getWeatherHealthStatus = () => {
  return {
    provider: 'Open-Meteo Weather API',
    status: 'ACTIVE',
    configured: true,
    requiresApiKey: false,
  };
};
