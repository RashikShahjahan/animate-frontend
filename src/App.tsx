import { Routes, Route } from 'react-router-dom';
import { AnalyticsProvider } from 'rashik-analytics-provider';
import HomePage from './pages/HomePage';
import AnimationPage from './pages/AnimationPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <AnalyticsProvider 
      serviceName="animate-frontend"
      endpoint="https://analytics.rashik.sh/api"
    >
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/animation/:id" element={<AnimationPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </AnalyticsProvider>
  );
}

// Add type declaration for the global p5 instance
declare global {
  interface Window {
    p5: any;
    p5Instance: any;
  }
}

export default App;
