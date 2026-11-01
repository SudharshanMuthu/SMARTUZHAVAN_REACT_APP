import { Router } from 'express';
import { getNews, getSchemes } from '../controllers/alerts.controller.js';

const router = Router();

router.get('/news', getNews);
router.get('/schemes', getSchemes);

export default router;
