import { fetchWeatherData, TAMIL_NADU_COORDINATES } from '../services/weather.service.js';

/**
 * GET /api/weather/current
 * Returns current weather and agricultural alerts for a given district or coordinates.
 */
export const getCurrentWeather = async (req, res, next) => {
  try {
    const { location, lat, lon } = req.query;

    const weather = await fetchWeatherData({
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      locationName: location || 'Trichy',
    });

    return res.status(200).json({
      status: 'success',
      data: weather,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/weather/forecast
 * Returns 7-day agricultural forecast.
 */
export const getWeatherForecast = async (req, res, next) => {
  try {
    const { location, lat, lon } = req.query;

    const weather = await fetchWeatherData({
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      locationName: location || 'Trichy',
    });

    return res.status(200).json({
      status: 'success',
      location: weather.location,
      source: weather.source,
      forecast: weather.forecast,
      advisories: weather.advisories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/weather/locations
 * Returns list of supported Tamil Nadu agricultural districts.
 */
export const getSupportedLocations = (req, res) => {
  const locations = Object.entries(TAMIL_NADU_COORDINATES).map(([key, val]) => ({
    id: key,
    nameEn: key,
    nameTa: val.nameTa,
    latitude: val.lat,
    longitude: val.lon,
  }));

  return res.status(200).json({
    status: 'success',
    data: locations,
  });
};
