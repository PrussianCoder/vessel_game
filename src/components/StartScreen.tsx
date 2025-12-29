import React from 'react';
import type { GameMode } from '../types/game';
import './StartScreen.css';

interface StartScreenProps {
  onStartGame: (mode: GameMode) => void;
  onShowGuide: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, onShowGuide }) => {
  return (
    <div className="start-screen">
      <div className="start-content">
        <div className="title-section">
          <h1 className="game-title">
            <span className="title-icon">🚢</span>
            Renom Vessel Game
          </h1>
          <p className="game-subtitle">配船計画最適化ゲーム</p>
        </div>

        <div className="button-section">
          <div className="mode-buttons">
            <button className="start-button normal-mode" onClick={() => onStartGame('normal')}>
              <span className="button-icon">▶</span>
              <span className="button-text">
                <span className="mode-name">通常モード</span>
                <span className="mode-desc">30ターン生き残れ！</span>
              </span>
            </button>
            <button className="start-button endless-mode" onClick={() => onStartGame('endless')}>
              <span className="button-icon">∞</span>
              <span className="button-text">
                <span className="mode-name">エンドレスモード</span>
                <span className="mode-desc">在庫切れまで挑戦！</span>
              </span>
            </button>
          </div>
          <button className="guide-button" onClick={onShowGuide}>
            <span className="button-icon">?</span>
            遊び方ガイド
          </button>
        </div>

        <div className="info-section">
          <div className="info-card">
            <div className="info-header">ゲーム目標</div>
            <p>複数の船を駆使して、</p>
            <p>なるべく多くの貨物を届けよう！</p>
          </div>
          <div className="ship-preview">
            <div className="ship-item">
              <span className="ship-emoji">🚢</span>
              <span>大型船</span>
            </div>
            <div className="ship-item">
              <span className="ship-emoji">⛵</span>
              <span>中型船</span>
            </div>
            <div className="ship-item">
              <span className="ship-emoji">🛥️</span>
              <span>小型船</span>
            </div>
          </div>
        </div>
      </div>

      <div className="background-decoration">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
    </div>
  );
};
