import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import type { GameState, TurnSnapshot, PortId, CargoColor } from '../types/game';
import 'leaflet/dist/leaflet.css';
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

// 貨物色の設定
const CARGO_COLORS: Record<CargoColor, string> = {
  red: '#ff6b6b',
  blue: '#4dabf7',
  yellow: '#ffd43b',
  green: '#7fff00',
};

const CARGO_COLOR_NAMES: Record<CargoColor, string> = {
  red: '赤',
  blue: '青',
  yellow: '黄',
  green: '緑',
};

const ALL_CARGO_COLORS: CargoColor[] = ['red', 'blue', 'yellow', 'green'];

// 船の識別色
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
      ships: state.ships.map((ship) => {
        // 色別の積載量を計算
        const cargoByColor: Record<CargoColor, number> = {
          red: 0,
          blue: 0,
          yellow: 0,
          green: 0,
        };
        ship.cargo.forEach((c) => {
          cargoByColor[c.color] += c.quantity;
        });
        return {
          id: ship.id,
          cargoCount: ship.cargo.reduce((sum, c) => sum + c.quantity, 0),
          cargoByColor,
          location: ship.currentPort || null,
          sailingTo: ship.sailingTo || null,
        };
      }),
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

  // 船ごとの積載量棒グラフを描画（積み上げ棒グラフ）
  const renderShipCargoChart = (shipId: string, shipCapacity: number) => {
    const width = 600;
    const height = 120;
    const padding = { top: 15, right: 20, bottom: 25, left: 35 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const barWidth = Math.max(4, Math.min(12, chartWidth / snapshots.length - 1));
    const xScale = (turn: number) =>
      padding.left + ((turn - 1) / Math.max(snapshots.length - 1, 1)) * (chartWidth - barWidth);
    const yScale = (value: number) =>
      chartHeight - (value / shipCapacity) * chartHeight;

    // Y軸のグリッド値を計算
    const yGridValues = shipCapacity <= 12
      ? [0, Math.round(shipCapacity / 2), shipCapacity]
      : [0, Math.round(shipCapacity / 3), Math.round(shipCapacity * 2 / 3), shipCapacity];

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="cargo-chart">
        {/* グリッド線 */}
        {yGridValues.map((v) => (
          <g key={v}>
            <line
              x1={padding.left}
              y1={padding.top + yScale(v)}
              x2={width - padding.right}
              y2={padding.top + yScale(v)}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="2,2"
            />
            <text
              x={padding.left - 5}
              y={padding.top + yScale(v)}
              textAnchor="end"
              alignmentBaseline="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="9"
            >
              {v}
            </text>
          </g>
        ))}

        {/* X軸ラベル */}
        {[1, 10, 20, 30].filter(t => t <= snapshots.length).map((t) => (
          <text
            key={t}
            x={xScale(t) + barWidth / 2}
            y={height - 5}
            textAnchor="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize="9"
          >
            {t}
          </text>
        ))}

        {/* 積み上げ棒グラフ */}
        {snapshots.map((snapshot) => {
          const shipData = snapshot.ships.find((s) => s.id === shipId);
          if (!shipData) return null;

          const x = xScale(snapshot.turn);
          let currentY = padding.top + chartHeight;

          return (
            <g key={snapshot.turn}>
              {ALL_CARGO_COLORS.map((color) => {
                const quantity = shipData.cargoByColor[color];
                if (quantity === 0) return null;

                const barHeight = (quantity / shipCapacity) * chartHeight;
                const y = currentY - barHeight;
                currentY = y;

                return (
                  <rect
                    key={color}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={CARGO_COLORS[color]}
                    opacity={0.85}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
    );
  };

  // 地図表示用の船選択状態
  const [selectedTrajectoryShip, setSelectedTrajectoryShip] = useState<string>(gameState.ships[0]?.id || '');

  // ターン選択状態（デフォルトは最終ターン）
  const maxTurn = snapshots.length;
  const [selectedTurn, setSelectedTurn] = useState<number>(maxTurn);

  // 選択した船の移動経路（ターンごとの位置をセグメント化、選択ターンまでフィルタ）
  const trajectorySegments = useMemo(() => {
    const trajectory = shipTrajectories[selectedTrajectoryShip];
    if (!trajectory) return [];

    const segments: { from: PortId; to: PortId; startTurn: number; endTurn: number }[] = [];
    let lastPort: PortId | null = null;

    // 選択したターンまでの軌跡のみ表示
    const limitedTrajectory = trajectory.slice(0, selectedTurn);

    limitedTrajectory.forEach((port, turnIndex) => {
      if (port && lastPort && port !== lastPort) {
        // 移動があった
        segments.push({
          from: lastPort,
          to: port,
          startTurn: turnIndex,
          endTurn: turnIndex + 1,
        });
      }
      if (port) {
        lastPort = port;
      }
    });

    return segments;
  }, [shipTrajectories, selectedTrajectoryShip, selectedTurn]);

  // 訪問した港のリスト（順番付き、選択ターンまでフィルタ）
  const visitedPorts = useMemo(() => {
    const trajectory = shipTrajectories[selectedTrajectoryShip];
    if (!trajectory) return [];

    const visited: { portId: PortId; turn: number }[] = [];
    let lastPort: PortId | null = null;

    // 選択したターンまでの訪問のみ表示
    const limitedTrajectory = trajectory.slice(0, selectedTurn);

    limitedTrajectory.forEach((port, turnIndex) => {
      if (port && port !== lastPort) {
        visited.push({ portId: port, turn: turnIndex + 1 });
        lastPort = port;
      }
    });

    return visited;
  }, [shipTrajectories, selectedTrajectoryShip, selectedTurn]);

  // 緯度経度変換
  const toLatLng = (lat: number, lng: number): [number, number] => [lat, lng];

  // 港マーカーアイコン
  const createPortIcon = (portId: PortId, visitOrder: number) => {
    const port = gameState.ports[portId];
    const isDemand = port?.type === 'demand';
    const size = 24;
    const color = isDemand ? getPortColor(portId) : '#666';

    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" font-size="10" fill="white" font-weight="bold">${visitOrder}</text>
      </svg>
    `;

    return L.divIcon({
      className: 'trajectory-port-icon',
      html: svg,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // 港の色を取得
  const getPortColor = (portId: PortId): string => {
    const port = gameState.ports[portId];
    if (!port) return '#666';
    if (port.type === 'demand' && port.demandColor) {
      const colors: Record<CargoColor, string> = {
        red: '#ff6b6b',
        blue: '#4dabf7',
        yellow: '#ffd43b',
        green: '#7fff00',
      };
      return colors[port.demandColor];
    }
    return '#666';
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

          {/* 船の積載量推移（船ごと） */}
          <div className="analysis-section">
            <h3>船の積載量推移</h3>
            <div className="cargo-legend">
              {ALL_CARGO_COLORS.map((color) => (
                <div key={color} className="legend-item">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: CARGO_COLORS[color] }}
                  />
                  <span>{CARGO_COLOR_NAMES[color]}</span>
                </div>
              ))}
            </div>
            {gameState.ships.map((ship) => (
              <div key={ship.id} className="ship-cargo-section">
                <div className="ship-cargo-header">
                  <span className="ship-cargo-name">{ship.name}</span>
                  <span className="ship-cargo-capacity">（最大{ship.capacity}個）</span>
                </div>
                <div className="chart-container compact">
                  {renderShipCargoChart(ship.id, ship.capacity)}
                </div>
              </div>
            ))}
          </div>

          {/* 船の移動軌跡（地図表示） */}
          <div className="analysis-section">
            <h3>船の移動軌跡</h3>
            <div className="trajectory-controls">
              <div className="control-row">
                <label htmlFor="ship-select">船を選択：</label>
                <select
                  id="ship-select"
                  value={selectedTrajectoryShip}
                  onChange={(e) => setSelectedTrajectoryShip(e.target.value)}
                  className="ship-select"
                >
                  {gameState.ships.map((ship) => (
                    <option key={ship.id} value={ship.id}>
                      {ship.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="control-row turn-slider-row">
                <label htmlFor="turn-slider">表示ターン：</label>
                <input
                  type="range"
                  id="turn-slider"
                  min={1}
                  max={maxTurn}
                  value={selectedTurn}
                  onChange={(e) => setSelectedTurn(Number(e.target.value))}
                  className="turn-slider"
                />
                <span className="turn-value">T{selectedTurn}</span>
              </div>
            </div>

            <div className="trajectory-map-container">
              <MapContainer
                center={[10, 125]}
                zoom={2.8}
                zoomSnap={0.1}
                scrollWheelZoom={true}
                dragging={true}
                zoomControl={false}
                doubleClickZoom={true}
                style={{ width: '100%', height: '350px', borderRadius: '8px' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 全ての航路（薄いグレー） */}
                {gameState.routes.map((route, idx) => {
                  const fromPort = gameState.ports[route.from];
                  const toPort = gameState.ports[route.to];
                  if (!fromPort || !toPort) return null;
                  return (
                    <Polyline
                      key={`route-${idx}`}
                      positions={[
                        toLatLng(fromPort.position.lat, fromPort.position.lng),
                        toLatLng(toPort.position.lat, toPort.position.lng),
                      ]}
                      pathOptions={{
                        color: 'rgba(255, 255, 255, 0.2)',
                        weight: 1,
                        dashArray: '4, 4',
                      }}
                    />
                  );
                })}

                {/* 全ての港（小さい点） */}
                {Object.values(gameState.ports).map((port) => (
                  <CircleMarker
                    key={`port-bg-${port.id}`}
                    center={toLatLng(port.position.lat, port.position.lng)}
                    radius={4}
                    pathOptions={{
                      color: port.type === 'demand' ? getPortColor(port.id) : '#666',
                      fillColor: port.type === 'demand' ? getPortColor(port.id) : '#444',
                      fillOpacity: 0.5,
                      weight: 1,
                    }}
                  />
                ))}

                {/* 移動軌跡のライン */}
                {trajectorySegments.map((segment, idx) => {
                  const fromPort = gameState.ports[segment.from];
                  const toPort = gameState.ports[segment.to];
                  if (!fromPort || !toPort) return null;

                  const shipColor = SHIP_COLORS[selectedTrajectoryShip] || '#ff9800';

                  return (
                    <Polyline
                      key={`trajectory-${idx}`}
                      positions={[
                        toLatLng(fromPort.position.lat, fromPort.position.lng),
                        toLatLng(toPort.position.lat, toPort.position.lng),
                      ]}
                      pathOptions={{
                        color: shipColor,
                        weight: 4,
                        opacity: 0.9,
                      }}
                    />
                  );
                })}

                {/* 訪問した港のマーカー（番号付き） */}
                {visitedPorts.map((visit, idx) => {
                  const port = gameState.ports[visit.portId];
                  if (!port) return null;

                  return (
                    <Marker
                      key={`visited-${idx}`}
                      position={toLatLng(port.position.lat, port.position.lng)}
                      icon={createPortIcon(visit.portId, idx + 1)}
                    />
                  );
                })}
              </MapContainer>
            </div>

            {/* 訪問順リスト */}
            <div className="visit-list">
              <span className="visit-list-label">訪問順：</span>
              {visitedPorts.map((visit, idx) => {
                const port = gameState.ports[visit.portId];
                return (
                  <span key={idx} className="visit-item">
                    <span className="visit-number">{idx + 1}</span>
                    <span className="visit-port-name">{port?.nameJp}</span>
                    <span className="visit-turn">T{visit.turn}</span>
                    {idx < visitedPorts.length - 1 && <span className="visit-arrow">→</span>}
                  </span>
                );
              })}
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
