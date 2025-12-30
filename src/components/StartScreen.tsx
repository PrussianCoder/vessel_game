import React, { useState } from 'react';
import type { GameMode, SupplyMode } from '../types/game';
import './StartScreen.css';

// バージョン履歴
const VERSION_HISTORY = [
  { version: 'ver1.3', date: '2025.12.30', description: '供給モードにランダムを追加' },
  { version: 'ver1.2', date: '2025.12.29', description: 'エンドレスモード追加' },
  { version: 'ver1.1', date: '2025.12.25', description: 'リリース' },
];

const CURRENT_VERSION = VERSION_HISTORY[0];

interface StartScreenProps {
  onStartGame: (mode: GameMode, supplyMode: SupplyMode) => void;
  onShowGuide: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, onShowGuide }) => {
  const [supplyMode, setSupplyMode] = useState<SupplyMode>('fixed');
  const [showVersionHistory, setShowVersionHistory] = useState(false);

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
            <button className="start-button normal-mode" onClick={() => onStartGame('normal', supplyMode)}>
              <span className="button-icon">▶</span>
              <span className="button-text">
                <span className="mode-name">通常モード</span>
                <span className="mode-desc">30ターン生き残れ！</span>
              </span>
            </button>
            <button className="start-button endless-mode" onClick={() => onStartGame('endless', supplyMode)}>
              <span className="button-icon">∞</span>
              <span className="button-text">
                <span className="mode-name">エンドレスモード</span>
                <span className="mode-desc">在庫切れまで挑戦！</span>
              </span>
            </button>
          </div>

          <div className="supply-mode-section">
            <span className="supply-mode-label">供給モード:</span>
            <div className="supply-mode-buttons">
              <button
                className={`supply-mode-btn ${supplyMode === 'fixed' ? 'active' : ''}`}
                onClick={() => setSupplyMode('fixed')}
              >
                固定
              </button>
              <button
                className={`supply-mode-btn ${supplyMode === 'random' ? 'active' : ''}`}
                onClick={() => setSupplyMode('random')}
              >
                ランダム
              </button>
            </div>
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

      <button className="version-info" onClick={() => setShowVersionHistory(true)}>
        {CURRENT_VERSION.version} ({CURRENT_VERSION.date})
      </button>

      {showVersionHistory && (
        <div className="version-modal-overlay" onClick={() => setShowVersionHistory(false)}>
          <div className="version-modal" onClick={(e) => e.stopPropagation()}>
            <div className="version-modal-header">
              <h3>バージョン履歴</h3>
              <button className="version-modal-close" onClick={() => setShowVersionHistory(false)}>
                ×
              </button>
            </div>
            <div className="version-modal-content">
              {VERSION_HISTORY.map((item, index) => (
                <div key={item.version} className={`version-item ${index === 0 ? 'current' : ''}`}>
                  <div className="version-item-header">
                    <span className="version-number">{item.version}</span>
                    <span className="version-date">{item.date}</span>
                  </div>
                  <p className="version-description">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="background-decoration">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
    </div>
  );
};
