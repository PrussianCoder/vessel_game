import React from 'react';
import type { GameState } from '../types/game';
import './GanttChart.css';

interface GanttChartProps {
  gameState: GameState;
  currentShipId?: string;
}

export const GanttChart: React.FC<GanttChartProps> = ({ gameState, currentShipId }) => {
  const { turn, maxTurns, ships, ports } = gameState;

  // ターンの配列を生成
  const turns = Array.from({ length: maxTurns }, (_, i) => i + 1);

  // 色名から日本語へ
  const getColorName = (color: string) => {
    switch (color) {
      case 'red': return '赤';
      case 'blue': return '青';
      case 'yellow': return '黄';
      case 'green': return '緑';
      default: return color;
    }
  };

  // 色名からCSSカラーへ
  const getCargoColor = (color: string) => {
    switch (color) {
      case 'red': return '#ff6b6b';
      case 'blue': return '#00bfff'; // 明るいシアン
      case 'yellow': return '#ffd43b';
      case 'green': return '#7fff00'; // 黄緑（チャートリューズ）で識別しやすく
      default: return '#888';
    }
  };

  // 船タイプから表示情報を取得
  const getShipDisplay = (type: string) => {
    switch (type) {
      case 'large': return { icon: '🚢', name: '大型船' };
      case 'medium': return { icon: '⛵', name: '中型船' };
      case 'small': return { icon: '🛥️', name: '小型船' };
      default: return { icon: '🚢', name: type };
    }
  };

  return (
    <div className="gantt-chart">
      <div className="gantt-header">
        <div className="gantt-ship-label">船</div>
        <div className="gantt-timeline">
          {turns.map((t) => (
            <div
              key={t}
              className={`gantt-turn ${t === turn ? 'current' : ''} ${t < turn ? 'past' : ''}`}
            >
              {t % 5 === 0 || t === 1 ? t : ''}
            </div>
          ))}
        </div>
      </div>

      {ships.map((ship) => {
        const totalCargo = ship.cargo.reduce((sum, c) => sum + c.quantity, 0);
        const location = ship.status === 'docked' && ship.currentPort
          ? ports[ship.currentPort].nameJp
          : ship.status === 'sailing' && ship.sailingTo
          ? `→${ports[ship.sailingTo].nameJp}`
          : '';
        const isCurrent = ship.id === currentShipId;

        const shipDisplay = getShipDisplay(ship.type);

        return (
          <div key={ship.id} className={`gantt-row ${isCurrent ? 'current' : ''}`}>
            <div className={`gantt-ship-name ${ship.type}`}>
              <span className="ship-icon">{shipDisplay.icon}</span>
              <span className="ship-name-text">{shipDisplay.name}</span>
              <span className="ship-location">@{location}</span>
            </div>
            <div className="gantt-cargo-display">
              {/* 積載量バー */}
              <div className="cargo-bar-container">
                <div className="cargo-bar-bg">
                  {ship.cargo.map((c, idx) => {
                    const widthPercent = (c.quantity / ship.capacity) * 100;
                    const prevWidth = ship.cargo.slice(0, idx).reduce((sum, pc) => sum + (pc.quantity / ship.capacity) * 100, 0);
                    return (
                      <div
                        key={idx}
                        className="cargo-bar-fill"
                        style={{
                          backgroundColor: getCargoColor(c.color),
                          width: `${widthPercent}%`,
                          left: `${prevWidth}%`,
                        }}
                      />
                    );
                  })}
                </div>
                <span className="cargo-count">{totalCargo}/{ship.capacity}</span>
              </div>
              {/* 積載詳細 */}
              <div className="cargo-details">
                {ship.cargo.length > 0 ? (
                  ship.cargo.map((c, idx) => (
                    <span
                      key={idx}
                      className="cargo-item"
                      style={{ color: getCargoColor(c.color) }}
                    >
                      {getColorName(c.color)}:{c.quantity}
                    </span>
                  ))
                ) : (
                  <span className="cargo-empty">空</span>
                )}
              </div>
            </div>
          </div>
        );
      })}

    </div>
  );
};
