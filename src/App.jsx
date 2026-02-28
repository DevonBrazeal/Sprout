import { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Home from './components/Home';

function App() {
  const [currentView, setCurrentView] = useState('onboarding'); // 'onboarding' | 'home'
  const [points, setPoints] = useState({ spark: 0, sprout: 0 });

  // Handle granting points across the app
  const addPoints = (type, amount) => {
    setPoints(prev => ({ ...prev, [type]: prev[type] + amount }));
  };

  const handleCompleteOnboarding = () => {
    setCurrentView('home');
  };

  return (
    <div className="app-container">
      {currentView === 'onboarding' ? (
        <Onboarding onComplete={handleCompleteOnboarding} addPoints={addPoints} />
      ) : (
        <Home points={points} addPoints={addPoints} />
      )}
    </div>
  );
}

export default App;
