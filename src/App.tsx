import { useState } from 'react';
import { Game } from './components/Game';
import { StartScreen } from './components/StartScreen';
import { TutorialModal } from './components/TutorialModal';
import type { GameMode, SupplyMode } from './types/game';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [supplyMode, setSupplyMode] = useState<SupplyMode>('fixed');
  const [showGuide, setShowGuide] = useState(false);

  const handleStartGame = (mode: GameMode, supply: SupplyMode) => {
    setGameMode(mode);
    setSupplyMode(supply);
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

  return <Game key={`${gameMode}-${supplyMode}`} gameMode={gameMode} supplyMode={supplyMode} onReturnToStart={handleReturnToStart} />;
}

export default App;
