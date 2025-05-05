import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnimationPage from './pages/AnimationPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/animation/:id" element={<AnimationPage />} />
    </Routes>
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
