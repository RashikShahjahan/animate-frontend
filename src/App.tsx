import { Routes, Route } from 'react-router-dom';
import { AnalyticsProvider } from 'rashik-analytics-provider';
import HomePage from './pages/HomePage';
import AnimationPage from './pages/AnimationPage';

function App() {
  return (
    <AnalyticsProvider 
      serviceName="animate-frontend"
      endpoint="https://analytics.rashik.sh/api"
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/animation/:id" element={<AnimationPage />} />
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
