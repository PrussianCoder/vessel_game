import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GameState, PortId, Ship, CargoColor } from '../types/game';
import 'leaflet/dist/leaflet.css';
import './GameMap.css';

interface PlannedRoute {
  shipId: string;
  from: PortId;
  to: PortId;
}

interface GameMapProps {
  gameState: GameState;
  onPortClick: (portId: PortId) => void;
  onShipClick: (ship: Ship) => void;
  selectedPortId: PortId | null;
  selectedShipId: string | null;
  highlightedPorts?: PortId[];
  selectedRoute?: { from: PortId; to: PortId } | null;
  plannedRoutes?: PlannedRoute[];
}

// ツールチップコンポーネント（マップ内で使用）
const PortTooltip: React.FC<{
  portId: PortId | null;
  ports: GameState['ports'];
}> = ({ portId, ports }) => {
  const map = useMap();

  if (!portId || !ports[portId]) return null;

  const port = ports[portId];
  const point = map.latLngToContainerPoint([port.position.lat, port.position.lng]);

  return (
    <div
      className="port-tooltip"
      style={{
        left: `${point.x}px`,
        top: `${point.y - 45}px`,
      }}
    >
      {port.nameJp}
    </div>
  );
};

// 緯度経度をLeaflet用の[lat, lng]タプルに変換
const toLatLng = (lat: number, lng: number): [number, number] => [lat, lng];

// 船ごとの固有色を定義
const SHIP_COLORS: Record<string, { primary: string; light: string }> = {
  large: { primary: '#ff922b', light: 'rgba(255, 146, 43, 0.5)' },    // オレンジ
  medium: { primary: '#be4bdb', light: 'rgba(190, 75, 219, 0.5)' },   // 紫
  small: { primary: '#f06595', light: 'rgba(240, 101, 149, 0.5)' },   // ピンク
};

// 船IDから色を取得
const getShipColor = (shipId: string, isCurrentShip: boolean): string => {
  const colors = SHIP_COLORS[shipId] || { primary: '#00ff00', light: 'rgba(0, 255, 0, 0.5)' };
  return isCurrentShip ? colors.primary : colors.light;
};

export const GameMap: React.FC<GameMapProps> = ({
  gameState,
  onPortClick,
  onShipClick,
  selectedPortId,
  selectedShipId,
  highlightedPorts = [],
  selectedRoute,
  plannedRoutes = [],
}) => {
  const { ports, ships, routes, cityInventories } = gameState;
  const [hoveredPortId, setHoveredPortId] = useState<PortId | null>(null);

  const handlePortHover = useCallback((portId: PortId | null) => {
    setHoveredPortId(portId);
  }, []);

  // 色名からCSSカラーへ
  const getCargoColor = (color: string) => {
    switch (color) {
      case 'red': return '#ff6b6b';
      case 'blue': return '#4dabf7';
      case 'yellow': return '#ffd43b';
      case 'green': return '#69db7c';
      default: return '#888';
    }
  };

  // 需要拠点の在庫を取得
  const getCityInventory = (portId: PortId, color: CargoColor): number => {
    const inv = cityInventories.find(i => i.portId === portId && i.color === color);
    return inv?.stock ?? 0;
  };

  // 現在選択中の船のハイライト色を取得
  const currentShipHighlightColor = selectedShipId ? (SHIP_COLORS[selectedShipId]?.primary || '#00ff00') : '#00ff00';

  // 需要拠点のアイコン（パイチャート風に在庫量を表示）
  const createDemandPortIcon = (portId: PortId, demandColor: CargoColor, isSelected: boolean, isHighlighted: boolean) => {
    const stock = getCityInventory(portId, demandColor);
    const maxStock = 25; // 最大在庫を想定
    const fillPercent = Math.min(100, (stock / maxStock) * 100);
    const color = getCargoColor(demandColor);
    const size = isHighlighted ? 36 : isSelected ? 32 : 28;
    const strokeWidth = isHighlighted ? 4 : isSelected ? 3 : 2;
    // ハイライト色を現在の船の色にする
    const strokeColor = isHighlighted ? currentShipHighlightColor : isSelected ? '#fff' : color;

    // SVGで円形ゲージを作成
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - fillPercent / 100);

    // ハイライト用のグロー効果も船の色に
    const glowFilter = isHighlighted ? `<defs><filter id="glow-${portId}"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>` : '';
    const filterAttr = isHighlighted ? `filter="url(#glow-${portId})"` : '';

    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${glowFilter}
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="#333" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${filterAttr}/>
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${radius * 2}"
          stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
          transform="rotate(-90 ${size/2} ${size/2})" opacity="0.9"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" font-size="10" fill="white" font-weight="bold">${stock}</text>
      </svg>
    `;

    return L.divIcon({
      className: `demand-port-icon ${isHighlighted ? 'highlighted' : ''}`,
      html: svg,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // 供給拠点のアイコン（灰色の丸 + 横に在庫表示）
  const createSupplyPortIcon = (port: typeof ports[PortId], isSelected: boolean, isHighlighted: boolean) => {
    const size = isHighlighted ? 32 : isSelected ? 28 : 24;
    const strokeWidth = isHighlighted ? 4 : isSelected ? 3 : 2;
    // ハイライト色を現在の船の色にする
    const strokeColor = isHighlighted ? currentShipHighlightColor : isSelected ? '#fff' : '#666';

    // 整数部分のみ表示（小数は累積中）
    const redStock = Math.floor(port.cargoStock.red);
    const blueStock = Math.floor(port.cargoStock.blue);
    const yellowStock = Math.floor(port.cargoStock.yellow);
    const greenStock = Math.floor(port.cargoStock.green);

    // グロー効果も船の色に
    const glowStyle = isHighlighted ? `filter: drop-shadow(0 0 6px ${currentShipHighlightColor});` : '';

    const html = `
      <div class="supply-port-marker ${isHighlighted ? 'highlighted' : ''}" style="${glowStyle}">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${size/2}" cy="${size/2}" r="${(size - strokeWidth) / 2}" fill="#666" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        </svg>
        <div class="supply-stock-labels">
          ${redStock > 0 ? `<span class="stock-label red">${redStock}</span>` : ''}
          ${blueStock > 0 ? `<span class="stock-label blue">${blueStock}</span>` : ''}
          ${yellowStock > 0 ? `<span class="stock-label yellow">${yellowStock}</span>` : ''}
          ${greenStock > 0 ? `<span class="stock-label green">${greenStock}</span>` : ''}
        </div>
      </div>
    `;

    return L.divIcon({
      className: `supply-port-icon ${isHighlighted ? 'highlighted' : ''}`,
      html: html,
      iconSize: [size + 60, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // 船タイプからアイコン絵文字を取得
  const getShipEmoji = (type: string) => {
    switch (type) {
      case 'large': return '🚢';
      case 'medium': return '⛵';
      case 'small': return '🛥️';
      default: return '🚢';
    }
  };

  // 船のカスタムアイコンを生成
  const createShipIcon = (ship: Ship, isSelected: boolean) => {
    const size = 44;
    const fontSize = 28;

    // 積載している貨物の色を箱で表示
    const cargoBoxes = ship.cargo.map(c => {
      const color = getCargoColor(c.color);
      return `<div class="ship-cargo-indicator" style="background-color:${color};">${c.quantity}</div>`;
    }).join('');

    const selectedStyle = isSelected ? 'filter: drop-shadow(0 0 4px #fff);' : '';
    const opacity = ship.status === 'sailing' ? 'opacity: 0.8;' : '';
    const shipEmoji = getShipEmoji(ship.type);

    return L.divIcon({
      className: 'ship-icon',
      html: `
        <div class="ship-marker ${ship.type}" style="${selectedStyle} ${opacity}">
          <span class="ship-emoji" style="font-size:${fontSize}px;">${shipEmoji}</span>
          ${cargoBoxes ? `<div class="cargo-indicators">${cargoBoxes}</div>` : ''}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <div className="game-map">
      <MapContainer
        center={[20, 130]}
        zoom={4}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 航路を描画 */}
        {routes.map((route, idx) => {
          const fromPort = ports[route.from];
          const toPort = ports[route.to];
          if (!fromPort || !toPort) return null;
          const fromLatLngPos = toLatLng(fromPort.position.lat, fromPort.position.lng);
          const toLatLngPos = toLatLng(toPort.position.lat, toPort.position.lng);
          return (
            <Polyline
              key={idx}
              positions={[fromLatLngPos, toLatLngPos]}
              pathOptions={{
                color: 'rgba(255, 255, 255, 0.3)',
                weight: 1,
                dashArray: '4, 4',
              }}
            />
          );
        })}

        {/* 予約されたルートを描画（船ごとに色分け、選択中以外は薄く表示） */}
        {plannedRoutes.map((route) => {
          if (!ports[route.from] || !ports[route.to]) return null;
          const isCurrentShip = route.shipId === selectedShipId;
          const routeColor = getShipColor(route.shipId, isCurrentShip);
          return (
            <Polyline
              key={`planned-${route.shipId}`}
              positions={[
                toLatLng(ports[route.from].position.lat, ports[route.from].position.lng),
                toLatLng(ports[route.to].position.lat, ports[route.to].position.lng),
              ]}
              pathOptions={{
                color: routeColor,
                weight: isCurrentShip ? 5 : 3,
                opacity: 1,
              }}
            />
          );
        })}

        {/* 港を描画 */}
        {Object.values(ports).map((port) => {
          const isDemand = port.type === 'demand';
          const isSelected = selectedPortId === port.id;
          const latLng = toLatLng(port.position.lat, port.position.lng);

          const isHighlighted = highlightedPorts.includes(port.id);
          const icon = isDemand && port.demandColor
            ? createDemandPortIcon(port.id, port.demandColor, isSelected, isHighlighted)
            : createSupplyPortIcon(port, isSelected, isHighlighted);

          return (
            <Marker
              key={port.id}
              position={latLng}
              icon={icon}
              eventHandlers={{
                click: () => onPortClick(port.id),
                mouseover: () => handlePortHover(port.id),
                mouseout: () => handlePortHover(null),
              }}
            />
          );
        })}

        {/* 船を描画 */}
        {ships.map((ship) => {
          let lat: number, lng: number;

          if (ship.status === 'docked' && ship.currentPort) {
            const port = ports[ship.currentPort];
            // 船を港の円の上に配置（オフセットなし）
            lat = port.position.lat;
            lng = port.position.lng;
          } else if (ship.status === 'sailing' && ship.sailingFrom && ship.sailingTo) {
            const fromPort = ports[ship.sailingFrom];
            const toPort = ports[ship.sailingTo];
            const progress = 1 - (ship.remainingTurns || 0) / (ship.totalTurns || 1);
            lat = fromPort.position.lat + (toPort.position.lat - fromPort.position.lat) * progress;
            lng = fromPort.position.lng + (toPort.position.lng - fromPort.position.lng) * progress;
          } else {
            return null;
          }

          const latLng = toLatLng(lat, lng);
          const isSelected = selectedShipId === ship.id;

          // 船がいる港を取得
          const shipPortId = ship.status === 'docked' ? ship.currentPort : null;
          // その港がハイライトされているか（到達可能か）
          const isDestination = shipPortId && highlightedPorts.includes(shipPortId);

          return (
            <Marker
              key={ship.id}
              position={latLng}
              icon={createShipIcon(ship, isSelected)}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  if (ship.status === 'docked') {
                    // 到達可能な港にいる船をクリックした場合は、その港への移動を優先
                    if (isDestination && shipPortId) {
                      onPortClick(shipPortId);
                    } else {
                      onShipClick(ship);
                    }
                  }
                },
              }}
            />
          );
        })}

        {/* 拠点名ツールチップ */}
        <PortTooltip portId={hoveredPortId} ports={ports} />
      </MapContainer>
    </div>
  );
};
