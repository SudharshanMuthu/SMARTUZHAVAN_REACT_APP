import { Router } from 'express';
import { ecosystemStore } from '../data/ecosystemStore.js';

const router = Router();

/**
 * GET /api/ecosystem/crops
 * Publicly query crops created by farmers or admin
 */
router.get('/crops', (req, res) => {
  const { crop, location, search, limit } = req.query;
  const data = ecosystemStore.getCrops({ crop, location, search, limit });
  res.json({ success: true, count: data.length, data });
});

/**
 * GET /api/ecosystem/warehouses
 * Publicly query verified warehouses across Tamil Nadu
 */
router.get('/warehouses', (req, res) => {
  const { search, limit } = req.query;
  const data = ecosystemStore.getWarehouses({ search, limit });
  res.json({ success: true, count: data.length, data });
});

/**
 * GET /api/ecosystem/vehicles
 * Publicly query transport fleet availability
 */
router.get('/vehicles', (req, res) => {
  const { vehicleType, location, search, limit } = req.query;
  const data = ecosystemStore.getVehicles({ vehicleType, location, search, limit });
  res.json({ success: true, count: data.length, data });
});

/**
 * GET /api/ecosystem/market-prices
 * Mandi price quotes across APMC markets
 */
router.get('/market-prices', (req, res) => {
  const data = ecosystemStore.getMarketPrices();
  res.json({ success: true, count: data.length, data });
});

/**
 * GET /api/ecosystem/alerts
 * Targeted agricultural alerts (role-based & district-based)
 */
router.get('/alerts', (req, res) => {
  const { role, district, category, limit } = req.query;
  const data = ecosystemStore.getAlerts({ role, district, category, limit });
  res.json({ success: true, count: data.length, data });
});

export default router;
