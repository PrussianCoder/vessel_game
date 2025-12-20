import { useState } from 'react';
import { Game } from './components/Game';
import { StartScreen } from './components/StartScreen';
import { TutorialModal } from './components/TutorialModal';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleShowGuide = () => {
    setShowGuide(true);
  };

  const handleCloseGuide = () => {
    setShowGuide(false);
  };

  const handleReturnToStart = () => {
    setGameStarted(false);
  };

  if (!gameStarted) {
    return (
      <>
        <StartScreen onStartGame={handleStartGame} onShowGuide={handleShowGuide} />
        <TutorialModal isOpen={showGuide} onClose={handleCloseGuide} />
      </>
    );
  }

  return <Game onReturnToStart={handleReturnToStart} />;
}

export default App;
