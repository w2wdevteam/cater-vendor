import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import DeliveryConfigPage from '@/pages/delivery-config/DeliveryConfigPage'
import MenusPage from '@/pages/menus/MenusPage'
import MenuCreatePage from '@/pages/menus/MenuCreatePage'
import MenuEditPage from '@/pages/menus/MenuEditPage'
import MenuCalendarPage from '@/pages/menus/MenuCalendarPage'
import MenuTemplatesPage from '@/pages/menus/MenuTemplatesPage'
import CompaniesPage from '@/pages/companies/CompaniesPage'
import CompanyDetailPage from '@/pages/companies/CompanyDetailPage'
import OrdersPage from '@/pages/orders/OrdersPage'
import OrderCreatePage from '@/pages/orders/OrderCreatePage'
import BulkOrderCreatePage from '@/pages/orders/BulkOrderCreatePage'
import KitchenPrepPage from '@/pages/orders/KitchenPrepPage'
import NotDeliveredPage from '@/pages/not-delivered/NotDeliveredPage'
import NotDeliveredDetailPage from '@/pages/not-delivered/NotDeliveredDetailPage'
import LocationsPage from '@/pages/locations/LocationsPage'
import PricingPage from '@/pages/pricing/PricingPage'
import ReportsLayout from '@/pages/reports/ReportsLayout'
import DailyReportPage from '@/pages/reports/DailyReportPage'
import DailyByLocationPage from '@/pages/reports/DailyByLocationPage'
import DailyByMenuPage from '@/pages/reports/DailyByMenuPage'
import RevenueReportPage from '@/pages/reports/RevenueReportPage'
import MonthlyReportPage from '@/pages/reports/MonthlyReportPage'
import InvoiceReportPage from '@/pages/reports/InvoiceReportPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import AdminsPage from '@/pages/settings/AdminsPage'
import AuditLogPage from '@/pages/settings/AuditLogPage'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },

      // Operations
      { path: '/delivery-config', element: <DeliveryConfigPage /> },
      { path: '/menus', element: <MenusPage /> },
      { path: '/menus/create', element: <MenuCreatePage /> },
      { path: '/menus/calendar', element: <MenuCalendarPage /> },
      { path: '/menus/templates', element: <MenuTemplatesPage /> },
      { path: '/menus/:id/edit', element: <MenuEditPage /> },
      { path: '/orders', element: <OrdersPage /> },
      { path: '/orders/create', element: <OrderCreatePage /> },
      { path: '/orders/bulk-create', element: <BulkOrderCreatePage /> },
      { path: '/orders/kitchen-prep', element: <KitchenPrepPage /> },

      // Clients
      { path: '/companies', element: <CompaniesPage /> },
      { path: '/companies/:id', element: <CompanyDetailPage /> },
      { path: '/locations', element: <LocationsPage /> },
      { path: '/pricing', element: <PricingPage /> },
      { path: '/not-delivered', element: <NotDeliveredPage /> },
      { path: '/not-delivered/:id', element: <NotDeliveredDetailPage /> },

      // Reports
      {
        path: '/reports',
        element: <ReportsLayout />,
        children: [
          { index: true, element: <Navigate to="/reports/by-company" replace /> },
          { path: 'by-company', element: <DailyReportPage /> },
          { path: 'by-location', element: <DailyByLocationPage /> },
          { path: 'by-menu', element: <DailyByMenuPage /> },
          { path: 'revenue', element: <RevenueReportPage /> },
          { path: 'monthly', element: <MonthlyReportPage /> },
          { path: 'invoice', element: <InvoiceReportPage /> },
        ],
      },

      // Account
      { path: '/settings', element: <SettingsPage /> },
      { path: '/settings/admins', element: <AdminsPage /> },
      { path: '/settings/audit-log', element: <AuditLogPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
