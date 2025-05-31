import { Routes, Route } from 'react-router-dom';
import { AnalyticsProvider } from 'rashik-analytics-provider';
import HomePage from './pages/HomePage';
import AnimationPage from './pages/AnimationPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UnprotectedRoute from './components/UnprotectedRoute';
import * as THREE from 'three';

function App() {
  return (
    <AnalyticsProvider 
      serviceName="animate-frontend"
      endpoint="https://analytics.rashik.sh/api"
    >
      <AuthProvider>
        <Routes>
          {/* Protected Routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
 
          {/* Unprotected Routes */}
          <Route 
            path="/register" 
            element={
              <UnprotectedRoute>
                <RegisterPage />
              </UnprotectedRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <UnprotectedRoute>
                <LoginPage />
              </UnprotectedRoute>
            } 
          />
          
          <Route 
          
            path="/animation/:id" 
            element={<AnimationPage />}
          />

          {/* Public routes accessible to all users */}
          <Route 
            path="/feed"
            element={<FeedPage />}
          />
          
          <Route
            path="/"
            element={<FeedPage />}
          />
        </Routes>
      </AuthProvider>
    </AnalyticsProvider>
  );
}

// Add type declaration for the global Three.js instances
declare global {
  interface Window {
    THREE: any;
    threeScene: THREE.Scene | null;
    threeRenderer: THREE.WebGLRenderer | null;
    threeCamera: THREE.Camera | null;
    threeAnimationId: number | null;
  }
}

export default App;
