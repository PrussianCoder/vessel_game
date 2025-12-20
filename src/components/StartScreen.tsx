import React from 'react';
import './StartScreen.css';

interface StartScreenProps {
  onStartGame: () => void;
  onShowGuide: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, onShowGuide }) => {
  return (
    <div className="start-screen">
      <div className="start-content">
        <div className="title-section">
          <h1 className="game-title">
            <span className="title-icon">🚢</span>
            Vessel Game
          </h1>
          <p className="game-subtitle">日本列島配船最適化ゲーム</p>
        </div>

        <div className="description-section">
          <p>海外の供給拠点から日本の需要都市へ</p>
          <p>貨物を輸送する戦略シミュレーション</p>
        </div>

        <div className="button-section">
          <button className="start-button" onClick={onStartGame}>
            <span className="button-icon">▶</span>
            ゲームスタート
          </button>
          <button className="guide-button" onClick={onShowGuide}>
            <span className="button-icon">?</span>
            遊び方ガイド
          </button>
        </div>

        <div className="info-section">
          <div className="info-card">
            <div className="info-header">ゲーム目標</div>
            <p>30ターン生き残れ！</p>
            <p className="info-detail">都市の在庫が0になるとゲームオーバー</p>
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
