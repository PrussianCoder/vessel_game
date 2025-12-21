import React, { useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GameState, PortId, Ship, CargoColor } from '../types/game';
import 'leaflet/dist/leaflet.css';
import './GameMap.css';

// モバイル判定
const isMobile = () => window.innerWidth <= 768;

interface PlannedRoute {
  shipId: string;
  from: PortId;
  to: PortId;
}

interface GameMapProps {
  gameState: GameState;
  onPortClick?: (portId: PortId) => void;
  onShipClick?: (ship: Ship) => void;
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

// BFSで最短パスを計算（経由する港のリストを返す）
const findPath = (
  from: PortId,
  to: PortId,
  routes: { from: PortId; to: PortId }[]
): PortId[] => {
  if (from === to) return [from];

  // 隣接リストを構築
  const adjacency = new Map<PortId, PortId[]>();
  for (const route of routes) {
    if (!adjacency.has(route.from)) adjacency.set(route.from, []);
    if (!adjacency.has(route.to)) adjacency.set(route.to, []);
    adjacency.get(route.from)!.push(route.to);
    adjacency.get(route.to)!.push(route.from);
  }

  // BFS
  const queue: PortId[] = [from];
  const visited = new Set<PortId>([from]);
  const parent = new Map<PortId, PortId>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === to) {
      // パスを復元
      const path: PortId[] = [];
      let node: PortId | undefined = to;
      while (node !== undefined) {
        path.unshift(node);
        node = parent.get(node);
      }
      return path;
    }

    for (const neighbor of adjacency.get(current) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  // パスが見つからない場合は直線
  return [from, to];
};

export const GameMap: React.FC<GameMapProps> = ({
  gameState,
  onPortClick,
  onShipClick,
  selectedPortId,
  selectedShipId,
  highlightedPorts = [],
  selectedRoute: _selectedRoute,
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
      case 'blue': return '#00bfff'; // 明るいシアン
      case 'yellow': return '#ffd43b';
      case 'green': return '#7fff00'; // 黄緑（チャートリューズ）で識別しやすく
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
    const baseSize = mobile ? 20 : 28;
    const size = isHighlighted ? baseSize + 8 : isSelected ? baseSize + 4 : baseSize;
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
    const baseSize = mobile ? 28 : 24;
    const size = isHighlighted ? baseSize + 8 : isSelected ? baseSize + 4 : baseSize;
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

    // 色ごとの在庫テキストを生成（モバイル用）
    const stockTexts: string[] = [];
    if (redStock > 0) stockTexts.push(`<tspan fill="#ff6b6b">${redStock}</tspan>`);
    if (blueStock > 0) stockTexts.push(`<tspan fill="#00bfff">${blueStock}</tspan>`);
    if (yellowStock > 0) stockTexts.push(`<tspan fill="#ffd43b">${yellowStock}</tspan>`);
    if (greenStock > 0) stockTexts.push(`<tspan fill="#7fff00">${greenStock}</tspan>`);
    const stockText = stockTexts.join('<tspan fill="white"> </tspan>');

    // モバイル版は円の中に色別在庫数を表示、PC版は横に詳細表示
    const html = mobile ? `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="${glowStyle}">
        <circle cx="${size/2}" cy="${size/2}" r="${(size - strokeWidth) / 2}" fill="#444" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" font-size="10" font-weight="bold">${stockText}</text>
      </svg>
    ` : `
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

    // モバイル版はシンプルな円のみ
    const iconWidth = mobile ? size : size + 60;
    const iconHeight = size;

    return L.divIcon({
      className: `supply-port-icon ${isHighlighted ? 'highlighted' : ''}`,
      html: html,
      iconSize: [iconWidth, iconHeight],
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

  // モバイル判定（初期レンダリング時）
  const mobile = useMemo(() => isMobile(), []);

  // スクロール境界（ゲームエリアを制限）
  const maxBounds = useMemo(() => L.latLngBounds(
    L.latLng(-80, 70),   // 南西（オーストラリア南部、インド西部）
    L.latLng(60, 170)    // 北東（樺太北部、太平洋）
  ), []);

  return (
    <div className="game-map">
      <MapContainer
        center={mobile ? [0, 125] : [22, 125]}
        zoom={mobile ? 2.7 : 4.0}
        zoomSnap={0.1}
        zoomDelta={0.5}
        scrollWheelZoom={true}
        dragging={true}
        zoomControl={false}
        doubleClickZoom={true}
        touchZoom={true}
        minZoom={2.5}
        maxZoom={6}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        style={mobile
          ? { width: '100%', height: '100%' }
          : { width: '90%', aspectRatio: '1/1', maxHeight: '85vh' }
        }
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
                color: 'rgba(255, 255, 255, 0.6)',
                weight: 2,
                dashArray: '6, 6',
              }}
            />
          );
        })}

        {/* 予約されたルートを描画（船ごとに色分け、エッジを経由するパスを表示） */}
        {plannedRoutes.map((route) => {
          if (!ports[route.from] || !ports[route.to]) return null;
          const isCurrentShip = route.shipId === selectedShipId;
          const routeColor = getShipColor(route.shipId, isCurrentShip);

          // パスを計算
          const path = findPath(route.from, route.to, routes);

          // パス上の各エッジを描画
          return path.slice(0, -1).map((portId, idx) => {
            const nextPortId = path[idx + 1];
            const fromPort = ports[portId];
            const toPort = ports[nextPortId];
            if (!fromPort || !toPort) return null;

            return (
              <Polyline
                key={`planned-${route.shipId}-${idx}`}
                positions={[
                  toLatLng(fromPort.position.lat, fromPort.position.lng),
                  toLatLng(toPort.position.lat, toPort.position.lng),
                ]}
                pathOptions={{
                  color: routeColor,
                  weight: isCurrentShip ? 5 : 3,
                  opacity: 1,
                }}
              />
            );
          });
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
                click: () => onPortClick?.(port.id),
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
                      onPortClick?.(shipPortId);
                    } else {
                      onShipClick?.(ship);
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
