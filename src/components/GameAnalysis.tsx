import React, { useMemo } from 'react';
import type { GameState, TurnSnapshot, PortId } from '../types/game';
import './GameAnalysis.css';

interface GameAnalysisProps {
  gameState: GameState;
  history: GameState[];
  onClose: () => void;
}

// 需要拠点のIDリスト
const DEMAND_PORTS: PortId[] = ['TKO', 'SAP', 'MYZ', 'KYT'];

// 色の設定
const CITY_COLORS: Record<PortId, string> = {
  TKO: '#ff6b6b',
  SAP: '#00bfff',
  MYZ: '#ffd43b',
  KYT: '#7fff00',
} as Record<PortId, string>;

const SHIP_COLORS: Record<string, string> = {
  large: '#ff9800',
  medium: '#9c27b0',
  small: '#00bcd4',
};

export const GameAnalysis: React.FC<GameAnalysisProps> = ({
  gameState,
  history,
  onClose,
}) => {
  // 履歴からスナップショットを生成
  const snapshots: TurnSnapshot[] = useMemo(() => {
    const allStates = [...history, gameState];
    return allStates.map((state) => ({
      turn: state.turn,
      cityInventories: state.cityInventories.map((inv) => ({
        portId: inv.portId,
        stock: inv.stock,
      })),
      ships: state.ships.map((ship) => ({
        id: ship.id,
        cargoCount: ship.cargo.reduce((sum, c) => sum + c.quantity, 0),
        location: ship.currentPort || null,
        sailingTo: ship.sailingTo || null,
      })),
      score: state.score,
    }));
  }, [history, gameState]);

  // グラフの最大値を計算
  const maxStock = useMemo(() => {
    let max = 20;
    snapshots.forEach((s) => {
      s.cityInventories.forEach((inv) => {
        if (inv.stock > max) max = inv.stock;
      });
    });
    return Math.ceil(max / 5) * 5; // 5の倍数に切り上げ
  }, [snapshots]);

  // 各船の最大積載量
  const maxCargo = useMemo(() => {
    const maxByShip: Record<string, number> = {};
    gameState.ships.forEach((ship) => {
      maxByShip[ship.id] = ship.capacity;
    });
    return maxByShip;
  }, [gameState.ships]);

  // 船の軌跡を生成
  const shipTrajectories = useMemo(() => {
    const trajectories: Record<string, (PortId | null)[]> = {};
    gameState.ships.forEach((ship) => {
      trajectories[ship.id] = [];
    });

    snapshots.forEach((snapshot) => {
      snapshot.ships.forEach((ship) => {
        trajectories[ship.id].push(ship.location || ship.sailingTo);
      });
    });

    return trajectories;
  }, [snapshots, gameState.ships]);

  // SVGグラフを描画
  const renderInventoryChart = () => {
    const width = 600;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const xScale = (turn: number) =>
      padding.left + ((turn - 1) / Math.max(snapshots.length - 1, 1)) * chartWidth;
    const yScale = (stock: number) =>
      padding.top + chartHeight - (stock / maxStock) * chartHeight;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="inventory-chart">
        {/* グリッド線 */}
        {[0, 5, 10, 15, 20].filter(v => v <= maxStock).map((v) => (
          <g key={v}>
            <line
              x1={padding.left}
              y1={yScale(v)}
              x2={width - padding.right}
              y2={yScale(v)}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="2,2"
            />
            <text
              x={padding.left - 5}
              y={yScale(v)}
              textAnchor="end"
              alignmentBaseline="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="10"
            >
              {v}
            </text>
          </g>
        ))}

        {/* X軸ラベル */}
        {[1, 10, 20, 30].filter(t => t <= snapshots.length).map((t) => (
          <text
            key={t}
            x={xScale(t)}
            y={height - 5}
            textAnchor="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize="10"
          >
            {t}
          </text>
        ))}

        {/* 危険ライン */}
        <line
          x1={padding.left}
          y1={yScale(3)}
          x2={width - padding.right}
          y2={yScale(3)}
          stroke="rgba(255,0,0,0.3)"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* 各都市のライン */}
        {DEMAND_PORTS.map((portId) => {
          const points = snapshots.map((s) => {
            const inv = s.cityInventories.find((i) => i.portId === portId);
            return { turn: s.turn, stock: inv?.stock ?? 0 };
          });

          const pathD = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.turn)} ${yScale(p.stock)}`)
            .join(' ');

          return (
            <path
              key={portId}
              d={pathD}
              fill="none"
              stroke={CITY_COLORS[portId]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
    );
  };

  // 船の積載量グラフを描画
  const renderCargoChart = () => {
    const width = 600;
    const height = 150;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const xScale = (turn: number) =>
      padding.left + ((turn - 1) / Math.max(snapshots.length - 1, 1)) * chartWidth;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="cargo-chart">
        {/* グリッド線 */}
        {[0, 12, 24].map((v) => (
          <g key={v}>
            <line
              x1={padding.left}
              y1={padding.top + chartHeight - (v / 24) * chartHeight}
              x2={width - padding.right}
              y2={padding.top + chartHeight - (v / 24) * chartHeight}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="2,2"
            />
            <text
              x={padding.left - 5}
              y={padding.top + chartHeight - (v / 24) * chartHeight}
              textAnchor="end"
              alignmentBaseline="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="10"
            >
              {v}
            </text>
          </g>
        ))}

        {/* 各船のライン */}
        {gameState.ships.map((ship) => {
          const points = snapshots.map((s) => {
            const shipData = s.ships.find((sh) => sh.id === ship.id);
            return { turn: s.turn, cargo: shipData?.cargoCount ?? 0 };
          });

          const yScale = (cargo: number) =>
            padding.top + chartHeight - (cargo / maxCargo[ship.id]) * chartHeight;

          const pathD = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.turn)} ${yScale(p.cargo)}`)
            .join(' ');

          return (
            <path
              key={ship.id}
              d={pathD}
              fill="none"
              stroke={SHIP_COLORS[ship.id]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
    );
  };

  // 船の軌跡を表示
  const renderTrajectory = (shipId: string) => {
    const trajectory = shipTrajectories[shipId];
    if (!trajectory) return null;

    // 連続する同じ場所をグループ化
    const groups: { port: PortId | null; start: number; end: number }[] = [];
    let currentPort: PortId | null = null;
    let start = 0;

    trajectory.forEach((port, i) => {
      if (port !== currentPort) {
        if (i > 0) {
          groups.push({ port: currentPort, start, end: i - 1 });
        }
        currentPort = port;
        start = i;
      }
    });
    groups.push({ port: currentPort, start, end: trajectory.length - 1 });

    return (
      <div className="trajectory-line">
        {groups.map((g, i) => {
          const portName = g.port ? gameState.ports[g.port]?.nameJp?.slice(0, 2) || g.port : '移動';
          const width = ((g.end - g.start + 1) / trajectory.length) * 100;
          return (
            <div
              key={i}
              className={`trajectory-segment ${g.port ? 'docked' : 'sailing'}`}
              style={{ width: `${width}%` }}
              title={`ターン${g.start + 1}${g.start !== g.end ? `〜${g.end + 1}` : ''}: ${portName}`}
            >
              <span className="segment-label">{portName}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="analysis-overlay">
      <div className="analysis-modal">
        <div className="analysis-header">
          <h2>ゲーム分析</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="analysis-content">
          {/* 都市在庫推移グラフ */}
          <div className="analysis-section">
            <h3>都市在庫推移</h3>
            <div className="chart-container">
              {renderInventoryChart()}
              <div className="chart-legend">
                {DEMAND_PORTS.map((portId) => (
                  <div key={portId} className="legend-item">
                    <span
                      className="legend-color"
                      style={{ backgroundColor: CITY_COLORS[portId] }}
                    />
                    <span>{gameState.ports[portId]?.nameJp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 船の積載量推移 */}
          <div className="analysis-section">
            <h3>船の積載量推移</h3>
            <div className="chart-container">
              {renderCargoChart()}
              <div className="chart-legend">
                {gameState.ships.map((ship) => (
                  <div key={ship.id} className="legend-item">
                    <span
                      className="legend-color"
                      style={{ backgroundColor: SHIP_COLORS[ship.id] }}
                    />
                    <span>{ship.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 船の軌跡 */}
          <div className="analysis-section">
            <h3>船の移動軌跡</h3>
            <div className="trajectory-container">
              {gameState.ships.map((ship) => (
                <div key={ship.id} className="trajectory-row">
                  <div className="trajectory-label">
                    <span
                      className="ship-color-dot"
                      style={{ backgroundColor: SHIP_COLORS[ship.id] }}
                    />
                    {ship.name}
                  </div>
                  {renderTrajectory(ship.id)}
                </div>
              ))}
              <div className="trajectory-axis">
                <span>1</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analysis-footer">
          <button className="close-analysis-btn" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
