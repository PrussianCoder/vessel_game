import React, { useState } from 'react';
import type { Ship, Port, PortId, CargoColor } from '../types/game';
import './ShipControlPanel.css';

interface ShipControlPanelProps {
  ship: Ship;
  port: Port;
  adjacentPorts: PortId[];
  ports: Record<PortId, Port>;
  remainingCapacity: number;
  canLoadColor: (color: CargoColor) => boolean;
  onLoadCargo: (color: CargoColor, quantity: number) => void;
  onSail: (destination: PortId) => void;
  onClose: () => void;
}

export const ShipControlPanel: React.FC<ShipControlPanelProps> = ({
  ship,
  port,
  adjacentPorts,
  ports,
  remainingCapacity,
  canLoadColor,
  onLoadCargo,
  onSail,
  onClose,
}) => {
  const [loadQuantities, setLoadQuantities] = useState<Record<CargoColor, number>>({
    red: 0,
    blue: 0,
    yellow: 0,
    green: 0,
  });

  const colors: CargoColor[] = ['red', 'blue', 'yellow', 'green'];
  const colorNames: Record<CargoColor, string> = {
    red: '赤',
    blue: '青',
    yellow: '黄',
    green: '緑',
  };

  const handleQuantityChange = (color: CargoColor, delta: number) => {
    setLoadQuantities((prev) => {
      const newQuantity = Math.max(0, prev[color] + delta);
      const maxQuantity = Math.min(port.cargoStock[color], remainingCapacity);
      return { ...prev, [color]: Math.min(newQuantity, maxQuantity) };
    });
  };

  const handleLoad = (color: CargoColor) => {
    const quantity = loadQuantities[color];
    if (quantity > 0) {
      onLoadCargo(color, quantity);
      setLoadQuantities((prev) => ({ ...prev, [color]: 0 }));
    }
  };

  const currentLoad = ship.cargo.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="ship-control-panel">
      <div className="panel-header">
        <h2 className={`ship-title ${ship.type}`}>{ship.name}</h2>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="panel-content">
        {/* 船の情報 */}
        <div className="ship-info">
          <div className="info-row">
            <span>現在地:</span>
            <span className="value">{port.nameJp}</span>
          </div>
          <div className="info-row">
            <span>積載:</span>
            <span className="value">
              {currentLoad} / {ship.capacity}
            </span>
          </div>
          <div className="info-row">
            <span>速度:</span>
            <span className="value">{ship.speed}</span>
          </div>
          {ship.maxColors > 1 && (
            <div className="info-row">
              <span>積載可能色数:</span>
              <span className="value">{ship.maxColors}色まで</span>
            </div>
          )}
        </div>

        {/* 現在の積荷 */}
        {ship.cargo.length > 0 && (
          <div className="current-cargo">
            <h4>積荷</h4>
            <div className="cargo-list">
              {ship.cargo.map((c, idx) => (
                <div key={idx} className={`cargo-item ${c.color}`}>
                  <span className="cargo-color">{colorNames[c.color]}</span>
                  <span className="cargo-quantity">×{c.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 積み込みセクション（供給拠点のみ） */}
        {port.type === 'supply' && (
          <div className="loading-section">
            <h4>積み込み</h4>
            {colors.map((color) => {
              const available = port.cargoStock[color];
              const canLoad = canLoadColor(color) && available > 0 && remainingCapacity > 0;

              return (
                <div key={color} className={`load-row ${color} ${!canLoad ? 'disabled' : ''}`}>
                  <div className="load-color-info">
                    <span className={`color-indicator ${color}`}></span>
                    <span className="color-name">{colorNames[color]}</span>
                    <span className="available">在庫: {available}</span>
                  </div>
                  {canLoad && (
                    <div className="load-controls">
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(color, -1)}
                        disabled={loadQuantities[color] <= 0}
                      >
                        −
                      </button>
                      <span className="quantity">{loadQuantities[color]}</span>
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(color, 1)}
                        disabled={
                          loadQuantities[color] >= available ||
                          loadQuantities[color] >= remainingCapacity
                        }
                      >
                        +
                      </button>
                      <button
                        className="load-btn"
                        onClick={() => handleLoad(color)}
                        disabled={loadQuantities[color] <= 0}
                      >
                        積む
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 出港先セクション */}
        <div className="sailing-section">
          <h4>出港先を選択</h4>
          <div className="destination-list">
            {adjacentPorts.map((destId) => {
              const destPort = ports[destId];

              return (
                <button
                  key={destId}
                  className={`destination-btn ${destPort.type}`}
                  onClick={() => onSail(destId)}
                >
                  <span className="dest-name">{destPort.nameJp}</span>
                  <span className="dest-info">
                    {destPort.type === 'demand' ? '需要拠点' : '供給拠点'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
