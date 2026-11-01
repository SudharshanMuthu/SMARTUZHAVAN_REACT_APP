import { Router } from 'express';
import {
  getCurrentWeather,
  getWeatherForecast,
  getSupportedLocations,
} from '../controllers/weather.controller.js';

const router = Router();

router.get('/current', getCurrentWeather);
router.get('/forecast', getWeatherForecast);
router.get('/locations', getSupportedLocations);

export default router;
