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



export default App;
