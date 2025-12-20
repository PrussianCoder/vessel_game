import React, { useMemo } from 'react';
import type { GameState, PortId } from '../types/game';
import { getDemandForPort } from '../config/gameConfig';
import './InfoPanel.css';

interface InfoPanelProps {
  gameState: GameState;
  plannedDestinations?: Record<string, PortId>;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ gameState, plannedDestinations = {} }) => {
  const { demandLevel, cityInventories, status, score, ports, ships } = gameState;

  // 在庫警告レベルを計算
  const getStockLevel = (stock: number): 'danger' | 'warning' | 'normal' => {
    if (stock <= 3) return 'danger';
    if (stock <= 8) return 'warning';
    return 'normal';
  };

  // 消費量を取得（DEMAND_TABLESから正確な値を取得）
  const getDemand = (portId: PortId): number => {
    return getDemandForPort(portId, demandLevel);
  };

  // 入荷予定の貨物量を計算（航海中の船 + 予約された船）
  const incomingCargo = useMemo(() => {
    const incoming: Record<PortId, number> = {} as Record<PortId, number>;

    ships.forEach(ship => {
      // 航海中の船（目的地が需要拠点の場合）
      if (ship.status === 'sailing' && ship.sailingTo) {
        const destPort = ports[ship.sailingTo];
        if (destPort.type === 'demand') {
          const cargoForCity = ship.cargo.find(c => c.color === destPort.demandColor);
          if (cargoForCity) {
            incoming[ship.sailingTo] = (incoming[ship.sailingTo] || 0) + cargoForCity.quantity;
          }
        }
      }

      // 停泊中で行き先が予約されている船
      if (ship.status === 'docked' && plannedDestinations[ship.id]) {
        const destPortId = plannedDestinations[ship.id];
        const destPort = ports[destPortId];
        if (destPort.type === 'demand') {
          const cargoForCity = ship.cargo.find(c => c.color === destPort.demandColor);
          if (cargoForCity) {
            incoming[destPortId] = (incoming[destPortId] || 0) + cargoForCity.quantity;
          }
        }
      }
    });

    return incoming;
  }, [ships, ports, plannedDestinations]);

  return (
    <div className="info-panel">
      {/* 都市在庫 */}
      <div className="info-section inventory-section">
        <h3>都市在庫</h3>
        <div className="inventory-header">
          <span className="header-city">都市</span>
          <span className="header-bar">在庫</span>
          <span className="header-stock">数</span>
          <span className="header-demand">消費</span>
          <span className="header-incoming">入荷</span>
        </div>
        {cityInventories.map((inv) => {
          const port = ports[inv.portId];
          const level = getStockLevel(inv.stock);
          const demand = getDemand(inv.portId);
          const incoming = incomingCargo[inv.portId] || 0;

          return (
            <div key={inv.portId} className={`inventory-row ${level}`}>
              <div className="inventory-city">
                <span className={`city-indicator ${inv.color}`}></span>
                {port.nameJp}
              </div>
              <div className="inventory-bar-container">
                <div
                  className={`inventory-bar ${inv.color}`}
                  style={{ width: `${Math.min(100, (inv.stock / 30) * 100)}%` }}
                />
              </div>
              <div className="inventory-value">{inv.stock}</div>
              <div className="inventory-demand">-{demand}</div>
              <div className={`inventory-incoming ${incoming > 0 ? 'has-incoming' : ''}`}>
                {incoming > 0 ? `+${incoming}` : '-'}
              </div>
            </div>
          );
        })}
      </div>

      {/* ゲーム状態表示 */}
      {status !== 'playing' && (
        <div className={`game-status-overlay ${status}`}>
          <div className="status-message">
            {status === 'gameover' ? 'GAME OVER' : 'GAME CLEAR!'}
          </div>
          <div className="final-score">最終スコア: {score}</div>
        </div>
      )}
    </div>
  );
};
