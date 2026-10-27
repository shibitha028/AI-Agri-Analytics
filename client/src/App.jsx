import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import UserLogin from './pages/UserLogin.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import CropAnalytics from './pages/CropAnalytics.jsx';
import HistoricalAnalytics from './pages/HistoricalAnalytics.jsx';
import RainfallAnalytics from './pages/RainfallAnalytics.jsx';
import SoilHealth from './pages/SoilHealth.jsx';
import WaterResources from './pages/WaterResources.jsx';
import ClimateSimulator from './pages/ClimateSimulator.jsx';
import LocationDetector from './pages/LocationDetector.jsx';
import AIFarmingAssistant from './pages/AIFarmingAssistant.jsx';
import PredictionHistory from './pages/PredictionHistory.jsx';
import Reports from './pages/Reports.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import DatasetUpload from './pages/admin/DatasetUpload.jsx';
import DataValidation from './pages/admin/DataValidation.jsx';
import RainfallDataAdmin from './pages/admin/RainfallDataAdmin.jsx';
import SoilDataAdmin from './pages/admin/SoilDataAdmin.jsx';
import CropDataAdmin from './pages/admin/CropDataAdmin.jsx';
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx';
import UploadHistoryPage from './pages/admin/UploadHistoryPage.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Public auth routes */}
      <Route path="/login" element={<UserLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/crop-analytics" element={<ProtectedRoute role="user"><CropAnalytics /></ProtectedRoute>} />
      <Route path="/historical-analytics" element={<ProtectedRoute role="user"><HistoricalAnalytics /></ProtectedRoute>} />
      <Route path="/rainfall-analytics" element={<ProtectedRoute role="user"><RainfallAnalytics /></ProtectedRoute>} />
      <Route path="/soil-health" element={<ProtectedRoute role="user"><SoilHealth /></ProtectedRoute>} />
      <Route path="/water-resources" element={<ProtectedRoute role="user"><WaterResources /></ProtectedRoute>} />
      <Route path="/climate-simulator" element={<ProtectedRoute role="user"><ClimateSimulator /></ProtectedRoute>} />
      <Route path="/location" element={<ProtectedRoute role="user"><LocationDetector /></ProtectedRoute>} />
      <Route path="/ai-assistant" element={<ProtectedRoute role="user"><AIFarmingAssistant /></ProtectedRoute>} />
      <Route path="/prediction-history" element={<ProtectedRoute role="user"><PredictionHistory /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute role="user"><Reports /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="user"><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute role="user"><Settings /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/dataset-upload" element={<ProtectedRoute role="admin"><DatasetUpload /></ProtectedRoute>} />
      <Route path="/admin/data-validation" element={<ProtectedRoute role="admin"><DataValidation /></ProtectedRoute>} />
      <Route path="/admin/rainfall-data" element={<ProtectedRoute role="admin"><RainfallDataAdmin /></ProtectedRoute>} />
      <Route path="/admin/soil-data" element={<ProtectedRoute role="admin"><SoilDataAdmin /></ProtectedRoute>} />
      <Route path="/admin/crop-data" element={<ProtectedRoute role="admin"><CropDataAdmin /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/upload-history" element={<ProtectedRoute role="admin"><UploadHistoryPage /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
