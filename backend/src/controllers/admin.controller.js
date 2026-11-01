import * as adminService from '../services/admin.service.js';
import { verifyAdminCredentials, createAdminToken } from '../utils/adminAuthUtil.js';

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both administrator username and password.',
      });
    }

    const isValid = verifyAdminCredentials(username, password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials. Access denied.',
      });
    }

    const token = createAdminToken(username);
    res.json({
      success: true,
      token,
      adminUser: {
        username,
        email: username.includes('@') ? username : 'admin@gmail.com',
        role: 'admin',
        isAdmin: true,
      },
      message: 'Admin authentication successful.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Authentication error.' });
  }
};

export const adminLogout = async (req, res) => {
  res.json({ success: true, message: 'Administrator session ended successfully.' });
};

export const getStats = async (req, res, next) => {
  try {
    const data = await adminService.getSystemStats();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, search, limit } = req.query;
    const users = await adminService.listUsers({ role, search, limit });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

export const toggleBlockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;
    const result = await adminService.toggleUserBlock(id, blocked, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const { crop, location, search, limit } = req.query;
    const posts = await adminService.listCropListings({ crop, location, search, limit });
    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await adminService.deleteCropListing(id, reason, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getServicesStatus = async (req, res, next) => {
  try {
    const status = await adminService.getServicesHealth();
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const logs = await adminService.getAuditLogs(limit);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

export const verifyAdminSession = async (req, res) => {
  // If request reached here, requireAdminAuth already verified token & admin privileges
  res.json({
    success: true,
    adminUser: req.adminUser,
    message: 'Administrator session is verified and active.',
  });
};

export const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await adminService.getUserDetails(id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateUserProfile(id, req.body, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const createCropListing = async (req, res, next) => {
  try {
    const result = await adminService.createCropListing(req.body, req.adminUser.email);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateCropListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateCropListing(id, req.body, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getWarehouses = async (req, res, next) => {
  try {
    const { search, limit } = req.query;
    const warehouses = await adminService.listWarehouses({ search, limit });
    res.json({ success: true, count: warehouses.length, data: warehouses });
  } catch (error) {
    next(error);
  }
};

export const createWarehouse = async (req, res, next) => {
  try {
    const result = await adminService.createWarehouse(req.body, req.adminUser.email);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateWarehouse(id, req.body, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteWarehouse(id, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getVehicles = async (req, res, next) => {
  try {
    const { search, limit } = req.query;
    const vehicles = await adminService.listVehicles({ search, limit });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const result = await adminService.createVehicle(req.body, req.adminUser.email);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateVehicle(id, req.body, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteVehicle(id, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const { type, status, limit } = req.query;
    const orders = await adminService.listOrders({ type, status, limit });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await adminService.updateOrderStatus(id, status, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getStorageBookings = async (req, res, next) => {
  try {
    const { status, limit } = req.query;
    const bookings = await adminService.listStorageBookings({ status, limit });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const updateStorageBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await adminService.updateStorageBookingStatus(id, status, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMarketPrices = async (req, res, next) => {
  try {
    const prices = await adminService.listMarketPrices();
    res.json({ success: true, count: prices.length, data: prices });
  } catch (error) {
    next(error);
  }
};

export const saveMarketPrice = async (req, res, next) => {
  try {
    const result = await adminService.saveMarketPrice(req.body, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteMarketPrice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteMarketPrice(id, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getAlerts = async (req, res, next) => {
  try {
    const { role, district, category, limit } = req.query;
    const alerts = await adminService.listAlerts({ role, district, category, limit });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    next(error);
  }
};

export const saveAlert = async (req, res, next) => {
  try {
    const result = await adminService.saveAlert(req.body, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteAlert(id, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getAppContent = async (req, res, next) => {
  try {
    const content = await adminService.getAppContent();
    res.json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
};

export const saveAppContent = async (req, res, next) => {
  try {
    const result = await adminService.saveAppContent(req.body, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
