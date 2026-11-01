import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';

import { LoginPage } from './pages/LoginPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { CropsPage } from './pages/CropsPage';
import { MarketPricesPage } from './pages/MarketPricesPage';
import { WarehousesPage } from './pages/WarehousesPage';
import { TransportPage } from './pages/TransportPage';
import { BookingsPage } from './pages/BookingsPage';
import { AlertsPage } from './pages/AlertsPage';
import { ContentPage } from './pages/ContentPage';
import { ServicesPage } from './pages/ServicesPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* Protected Administrator Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="crops" element={<CropsPage />} />
              <Route path="market-prices" element={<MarketPricesPage />} />
              <Route path="warehouses" element={<WarehousesPage />} />
              <Route path="transport" element={<TransportPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="content" element={<ContentPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
