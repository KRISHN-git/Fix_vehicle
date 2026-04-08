import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DetectCar from './pages/DetectCar';
import AnalyzeSeverity from './pages/AnalyzeSeverity';
import DetectDamage from './pages/DetectDamage';
import EstimateCost from './pages/EstimateCost';
import Summary from './pages/Summary';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import Analytics from './pages/Analytics';
import ProtectedRoute from './components/ProtectedRoute';
import { DamageProvider } from './context/DamageContext';
import { AuthProvider } from './context/AuthContext';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <DamageProvider>
        <Router>
          <Toaster position="top-center" reverseOrder={false} />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="detect-car" element={
                <ProtectedRoute>
                  <DetectCar />
                </ProtectedRoute>
              } />
              <Route path="analyze-severity" element={
                <ProtectedRoute>
                  <AnalyzeSeverity />
                </ProtectedRoute>
              } />
              <Route path="detect-damage" element={
                <ProtectedRoute>
                  <DetectDamage />
                </ProtectedRoute>
              } />
              <Route path="estimate-cost" element={
                <ProtectedRoute>
                  <EstimateCost />
                </ProtectedRoute>
              } />
              <Route path="summary" element={
                <ProtectedRoute>
                  <Summary />
                </ProtectedRoute>
              } />
              <Route path="history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />
              <Route path="analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </DamageProvider>
    </AuthProvider>
  );
}

export default App;
