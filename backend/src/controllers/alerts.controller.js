import { getAgriNews, getGovtSchemes } from '../services/alerts.service.js';

/**
 * GET /api/alerts/news?category=All
 */
export const getNews = (req, res) => {
  const { category, role, district } = req.query;
  const news = getAgriNews({ category, role, district });
  return res.status(200).json({
    status: 'success',
    count: news.length,
    data: news,
  });
};

/**
 * GET /api/alerts/schemes?category=All
 */
export const getSchemes = (req, res) => {
  const { category } = req.query;
  const schemes = getGovtSchemes(category);
  return res.status(200).json({
    status: 'success',
    count: schemes.length,
    data: schemes,
  });
};
