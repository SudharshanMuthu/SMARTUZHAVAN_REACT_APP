import { Router } from 'express';
import { requireAdminAuth } from '../middleware/adminAuth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// ==========================================
// Public Authentication Endpoints
// ==========================================
router.post('/auth/login', adminController.adminLogin);
router.post('/auth/logout', adminController.adminLogout);

// ==========================================
// Protected Routes - Require Admin Authorization
// ==========================================
router.use(requireAdminAuth);

// Session Verification & Overview Stats
router.get('/session', adminController.verifyAdminSession);
router.get('/stats', adminController.getStats);

// User Management (All Roles: Farmer, Transporter, Warehouse, Buyer)
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id', adminController.updateUserProfile);
router.patch('/users/:id/block', adminController.toggleBlockUser);

// Crop Marketplace Management
router.get('/crops', adminController.getPosts);
router.post('/crops', adminController.createCropListing);
router.patch('/crops/:id', adminController.updateCropListing);
router.delete('/crops/:id', adminController.deletePost);
// Backward compatibility aliases
router.get('/posts', adminController.getPosts);
router.delete('/posts/:id', adminController.deletePost);

// Warehouse Facility Management
router.get('/warehouses', adminController.getWarehouses);
router.post('/warehouses', adminController.createWarehouse);
router.patch('/warehouses/:id', adminController.updateWarehouse);
router.delete('/warehouses/:id', adminController.deleteWarehouse);

// Transport & Vehicle Management
router.get('/vehicles', adminController.getVehicles);
router.post('/vehicles', adminController.createVehicle);
router.patch('/vehicles/:id', adminController.updateVehicle);
router.delete('/vehicles/:id', adminController.deleteVehicle);

// Orders & Bookings
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);
router.get('/storage-bookings', adminController.getStorageBookings);
router.patch('/storage-bookings/:id/status', adminController.updateStorageBookingStatus);

// Market Price Records
router.get('/market-prices', adminController.getMarketPrices);
router.post('/market-prices', adminController.saveMarketPrice);
router.delete('/market-prices/:id', adminController.deleteMarketPrice);

// Agricultural Alerts & Notifications
router.get('/alerts', adminController.getAlerts);
router.post('/alerts', adminController.saveAlert);
router.delete('/alerts/:id', adminController.deleteAlert);

// Shared App Content & Configurations
router.get('/content', adminController.getAppContent);
router.patch('/content', adminController.saveAppContent);

// System Health & Audit Logging
router.get('/services', adminController.getServicesStatus);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
