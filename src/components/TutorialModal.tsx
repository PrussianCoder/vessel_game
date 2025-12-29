import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TutorialModal.css';

// 地図サイズを再計算するコンポーネント
const MapResizer: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    // 少し遅延させてからinvalidateSizeを呼び出す
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// インタラクティブな貨物積み込み練習コンポーネント
const InteractiveCargoStep: React.FC = () => {
  const SHIP_CAPACITY = 18;
  const MAX_COLORS = 2;

  // 船の積荷（色の配列）
  const [shipCargo, setShipCargo] = useState<string[]>([]);
  // 港の在庫
  const [portStock, setPortStock] = useState({ blue: 4, yellow: 4 });

  const getLoadedColors = () => {
    const colors = new Set(shipCargo);
    return colors.size;
  };

  const handleLoadCargo = (color: 'blue' | 'yellow') => {
    if (shipCargo.length >= SHIP_CAPACITY) return;
    if (portStock[color] <= 0) return;

    const loadedColors = getLoadedColors();
    const hasThisColor = shipCargo.includes(color);

    if (!hasThisColor && loadedColors >= MAX_COLORS) return;

    setShipCargo([...shipCargo, color]);
    setPortStock({ ...portStock, [color]: portStock[color] - 1 });
  };

  const handleUnloadCargo = (index: number) => {
    const color = shipCargo[index] as 'blue' | 'yellow';
    const newCargo = [...shipCargo];
    newCargo.splice(index, 1);
    setShipCargo(newCargo);
    setPortStock({ ...portStock, [color]: portStock[color] + 1 });
  };

  const handleReset = () => {
    setShipCargo([]);
    setPortStock({ blue: 4, yellow: 4 });
  };

  return (
    <div className="tutorial-step">
      <div className="interactive-cargo-demo">
        {/* 船のヘッダー */}
        <div className="demo-ship-header">
          <button className="demo-nav-btn">◀ 前</button>
          <span className="demo-ship-name">中型船</span>
          <button className="demo-nav-btn">次 ▶</button>
        </div>
        <div className="demo-ship-info">
          現在地: パラオ　積載: {shipCargo.length}/{SHIP_CAPACITY}　積載可能色数: {MAX_COLORS}
        </div>

        {/* 船の積荷 */}
        <div className="demo-cargo-section">
          <div className="demo-cargo-label">船の積荷（クリックで戻す）</div>
          <div className="demo-cargo-grid">
            {[...Array(SHIP_CAPACITY)].map((_, i) => {
              const cargo = shipCargo[i];
              return (
                <div
                  key={i}
                  className={`demo-cargo-slot ${cargo || 'empty'} ${cargo ? 'clickable' : ''}`}
                  onClick={() => cargo && handleUnloadCargo(i)}
                />
              );
            })}
          </div>
        </div>

        {/* 港の在庫 */}
        <div className="demo-cargo-section">
          <div className="demo-cargo-label">港の在庫（クリックで積み込み）</div>
          <div className="demo-port-stock">
            {portStock.blue > 0 &&
              [...Array(portStock.blue)].map((_, i) => (
                <div
                  key={`blue-${i}`}
                  className="demo-cargo-slot blue clickable"
                  onClick={() => handleLoadCargo('blue')}
                />
              ))}
            {portStock.yellow > 0 &&
              [...Array(portStock.yellow)].map((_, i) => (
                <div
                  key={`yellow-${i}`}
                  className="demo-cargo-slot yellow clickable"
                  onClick={() => handleLoadCargo('yellow')}
                />
              ))}
            {portStock.blue === 0 && portStock.yellow === 0 && (
              <div className="demo-empty-message">在庫なし</div>
            )}
          </div>
        </div>

        {/* リセットボタン */}
        <button className="demo-reset-btn" onClick={handleReset}>
          リセット
        </button>
      </div>

      <div className="step-explanation">
        <p><strong>供給拠点</strong>にいる船は貨物を積むことができます。</p>
        <ul className="tutorial-tips">
          <li>港の在庫（下の色付きボックス）をクリック → 船に積む</li>
          <li>船の積荷（上の色付きボックス）をクリック → 港に戻す</li>
        </ul>
        <p className="cargo-note">※需要拠点（日本の都市）では貨物を積めません</p>
        <div className="tip-box">
          <span className="tip-icon">💡</span>
          <span>大型船・中型船は2色まで積載可能！小型船は1色のみです。</span>
        </div>
      </div>
    </div>
  );
};

// 各ステップの定義

// 画面構成の説明（実際のゲーム画面を表示）
const ScreenLayoutStep: React.FC = () => (
  <div className="tutorial-step">
    <div className="screen-screenshot-container">
      <img
        src="/tutorial-screenshot.png"
        alt="ゲーム画面"
        className="screen-screenshot"
      />
    </div>
    <div className="step-explanation">
      <div className="layout-legend">
        <div className="legend-row">
          <span className="legend-icon">🗺️</span>
          <span><strong>地図（中央）</strong>：港をクリックして行き先を選択</span>
        </div>
        <div className="legend-row">
          <span className="legend-icon">🚢</span>
          <span><strong>船操作（左）</strong>：貨物の積み込み・荷下ろし</span>
        </div>
        <div className="legend-row">
          <span className="legend-icon">📊</span>
          <span><strong>情報パネル（右）</strong>：都市の在庫状況を確認</span>
        </div>
      </div>
    </div>
  </div>
);

// 供給拠点の説明ページ
const SupplyPortStep: React.FC = () => (
  <div className="tutorial-step">
    <div className="step-visual">
      <div className="supply-port-demo">
        <div className="supply-port-title">供給拠点</div>
        <div className="supply-port-list">
          <div className="supply-port-item">
            <span className="port-icon">🏭</span>
            <span className="port-name">ロシア</span>
            <div className="port-production">
              <span className="cargo-dot blue"></span>
              <span className="cargo-dot yellow"></span>
              <span className="production-text">各0〜1個/ターン</span>
            </div>
          </div>
          <div className="supply-port-item">
            <span className="port-icon">🏭</span>
            <span className="port-name">韓国</span>
            <div className="port-production">
              <span className="cargo-dot red"></span>
              <span className="cargo-dot blue"></span>
              <span className="production-text">各0〜1個/ターン</span>
            </div>
          </div>
          <div className="supply-port-item">
            <span className="port-icon">🏭</span>
            <span className="port-name">台湾</span>
            <div className="port-production">
              <span className="cargo-dot red"></span>
              <span className="cargo-dot blue"></span>
              <span className="production-text">各0〜1個/ターン</span>
            </div>
          </div>
          <div className="supply-port-item">
            <span className="port-icon">🏭</span>
            <span className="port-name">インドネシア</span>
            <div className="port-production">
              <span className="cargo-dot red"></span>
              <span className="cargo-dot blue"></span>
              <span className="production-text">赤0〜2/青0〜1</span>
            </div>
          </div>
        </div>
        <div className="stock-limit-info">
          <span className="limit-icon">📦</span>
          <span className="limit-text">在庫上限: 各色6〜10個（港により異なる）</span>
        </div>
      </div>
    </div>
    <div className="step-explanation">
      <p><strong>供給拠点</strong>では毎ターン貨物が生産されます。</p>
      <ul className="tutorial-tips">
        <li>各港で生産される<strong>色</strong>と<strong>生産量</strong>は決まっています</li>
        <li>在庫は<strong>各色6〜10個が上限</strong>（超過分は消滅）</li>
        <li><strong>地図上</strong>に各供給拠点の在庫が色ごとに表示されます</li>
      </ul>
      <div className="tip-box">
        <span className="tip-icon">💡</span>
        <span>在庫が溜まりすぎる前に回収しよう！</span>
      </div>
    </div>
  </div>
);

const GoalStep: React.FC = () => (
  <div className="tutorial-goal">
    <div className="goal-banner">
      <span className="goal-icon">🎯</span>
      <span className="goal-text">多くの荷物を届けよう！</span>
    </div>
    <p className="goal-description">
      <strong>供給拠点</strong>（海外の港）で貨物を積み、<strong>需要拠点</strong>（日本の4都市）へ届けましょう。
      <br />
      <strong className="warning-text">都市の在庫が0になるとゲームオーバー！</strong>
    </p>
    <div className="game-modes-section">
      <div className="game-mode-item normal">
        <span className="mode-icon">▶</span>
        <div className="mode-info">
          <span className="mode-name">通常モード</span>
          <span className="mode-desc">30ターン生き残ればクリア！</span>
        </div>
      </div>
      <div className="game-mode-item endless">
        <span className="mode-icon">∞</span>
        <div className="mode-info">
          <span className="mode-name">エンドレスモード</span>
          <span className="mode-desc">在庫切れまで挑戦し続ける！</span>
        </div>
      </div>
    </div>
    <div className="city-color-mapping">
      <div className="mapping-title">各都市には対応する色の貨物を届けます</div>
      <div className="mapping-list">
        <span className="mapping-item"><span className="city-dot red"></span>東京＝赤</span>
        <span className="mapping-item"><span className="city-dot blue"></span>札幌＝青</span>
        <span className="mapping-item"><span className="city-dot yellow"></span>宮崎＝黄</span>
        <span className="mapping-item"><span className="city-dot green"></span>京都＝緑</span>
      </div>
    </div>
    <div className="score-info">
      <span className="score-icon">🏆</span>
      <span className="score-text">スコア = 配達した貨物の総数</span>
    </div>
  </div>
);

const ShipSelectStep: React.FC = () => (
  <div className="tutorial-step">
    <div className="step-visual">
      <div className="mock-ship-panel">
        <div className="mock-ship-nav">
          <button className="mock-nav-btn">◀ 前</button>
          <span className="mock-ship-name">大型船</span>
          <button className="mock-nav-btn active">次 ▶</button>
        </div>
        <div className="mock-ship-info">現在地: 東京　積載: 0/24</div>
      </div>
    </div>
    <div className="step-explanation">
      <p><strong>「前」「次」ボタン</strong>で操作する船を切り替えます。</p>
      <div className="tip-box">
        <span className="tip-icon">💡</span>
        <span>1ターンで全ての船を操作できます。全船の行き先を決めてからターンを進めましょう！</span>
      </div>
    </div>
    <div className="ship-list-preview">
      <div className="ship-preview-item">
        <span>🚢</span>
        <span>大型船 - 積載24個/速度1/2色</span>
      </div>
      <div className="ship-preview-item">
        <span>⛵</span>
        <span>中型船 - 積載18個/速度2/2色</span>
      </div>
      <div className="ship-preview-item">
        <span>🛥️</span>
        <span>小型船 - 積載12個/速度3/1色</span>
      </div>
    </div>
    <div className="speed-explanation">
      <span className="speed-note">※速度 = 1ターンで移動できる航路の数</span>
    </div>
  </div>
);

// チュートリアル用の港データ（デモ用に簡略化）
const TUTORIAL_PORTS = {
  // 供給拠点
  RUS: { lat: 43.1155, lng: 131.8855, nameJp: 'ロシア', type: 'supply' },
  KOR: { lat: 37.4563, lng: 126.7052, nameJp: '韓国', type: 'supply' },
  TAW: { lat: 25.0330, lng: 121.5654, nameJp: '台湾', type: 'supply' },
  // 需要拠点
  SAP: { lat: 43.0618, lng: 141.3545, nameJp: '札幌', type: 'demand', color: '#4dabf7' },
  TKO: { lat: 35.6762, lng: 139.6503, nameJp: '東京', type: 'demand', color: '#ff6b6b' },
  KYT: { lat: 35.6681, lng: 135.1500, nameJp: '京都', type: 'demand', color: '#69db7c' },
  MYZ: { lat: 31.9077, lng: 131.4202, nameJp: '宮崎', type: 'demand', color: '#ffd43b' },
};

// チュートリアル用の航路（韓国からの接続を表示）
const TUTORIAL_ROUTES = [
  { from: 'KOR', to: 'SAP' },
  { from: 'KOR', to: 'KYT' },
  { from: 'KOR', to: 'MYZ' },
  { from: 'KOR', to: 'RUS' },
  { from: 'KOR', to: 'TAW' },
  { from: 'RUS', to: 'SAP' },
  { from: 'TAW', to: 'MYZ' },
  { from: 'SAP', to: 'KYT' },
  { from: 'TKO', to: 'SAP' },
  { from: 'TKO', to: 'MYZ' },
];

// チュートリアル用の港アイコン作成
const createTutorialPortIcon = (port: typeof TUTORIAL_PORTS[keyof typeof TUTORIAL_PORTS], isHighlighted: boolean, isSelected: boolean) => {
  const size = isHighlighted || isSelected ? 32 : 24;
  const strokeWidth = isHighlighted ? 4 : isSelected ? 3 : 2;
  const color = port.type === 'demand' && 'color' in port ? port.color : '#666';
  const strokeColor = isHighlighted ? '#00ff00' : isSelected ? '#ff69b4' : color;
  const glowStyle = isHighlighted ? 'filter: drop-shadow(0 0 8px #00ff00);' : isSelected ? 'filter: drop-shadow(0 0 6px #ff69b4);' : '';

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="${glowStyle}">
      <circle cx="${size/2}" cy="${size/2}" r="${(size - strokeWidth) / 2}" fill="${port.type === 'demand' ? '#333' : '#666'}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      ${port.type === 'demand' ? `<circle cx="${size/2}" cy="${size/2}" r="${(size - strokeWidth) / 3}" fill="${color}" opacity="0.9"/>` : ''}
    </svg>
  `;

  return L.divIcon({
    className: 'tutorial-port-icon',
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// チュートリアル用の船アイコン
const createTutorialShipIcon = () => {
  return L.divIcon({
    className: 'tutorial-ship-icon',
    html: '<span style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">⛵</span>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// 行き先選択ステップ（Leaflet地図を使用）
const DestinationStep: React.FC = () => {
  // ハイライト対象: 韓国から直接行ける港（SAP, KYT, MYZ）
  const highlightedPorts = ['SAP', 'KYT', 'MYZ'];
  // 選択された行き先: 宮崎
  const selectedDestination = 'MYZ';
  // 船の現在地: 韓国
  const shipLocation = TUTORIAL_PORTS.KOR;

  return (
    <div className="tutorial-step">
      <div className="step-visual">
        <div className="tutorial-map-container">
          <MapContainer
            center={[35, 133]}
            zoom={4.2}
            zoomSnap={0.1}
            scrollWheelZoom={false}
            dragging={false}
            zoomControl={false}
            doubleClickZoom={false}
            touchZoom={false}
            style={{ width: '100%', height: '220px', borderRadius: '8px' }}
          >
            <MapResizer />
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 航路を描画 */}
            {TUTORIAL_ROUTES.map((route, idx) => {
              const fromPort = TUTORIAL_PORTS[route.from as keyof typeof TUTORIAL_PORTS];
              const toPort = TUTORIAL_PORTS[route.to as keyof typeof TUTORIAL_PORTS];
              if (!fromPort || !toPort) return null;
              return (
                <Polyline
                  key={idx}
                  positions={[[fromPort.lat, fromPort.lng], [toPort.lat, toPort.lng]]}
                  pathOptions={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    weight: 2,
                    dashArray: '6, 6',
                  }}
                />
              );
            })}

            {/* 選択された経路（韓国→宮崎）をピンク色で描画 */}
            <Polyline
              positions={[[TUTORIAL_PORTS.KOR.lat, TUTORIAL_PORTS.KOR.lng], [TUTORIAL_PORTS.MYZ.lat, TUTORIAL_PORTS.MYZ.lng]]}
              pathOptions={{
                color: '#ff69b4',
                weight: 4,
                opacity: 1,
              }}
            />

            {/* 港を描画 */}
            {Object.entries(TUTORIAL_PORTS).map(([id, port]) => {
              const isHighlighted = highlightedPorts.includes(id);
              const isSelected = id === selectedDestination;
              return (
                <Marker
                  key={id}
                  position={[port.lat, port.lng]}
                  icon={createTutorialPortIcon(port, isHighlighted, isSelected)}
                />
              );
            })}

            {/* 船を韓国に配置 */}
            <Marker
              position={[shipLocation.lat, shipLocation.lng]}
              icon={createTutorialShipIcon()}
            />
          </MapContainer>
        </div>
      </div>
      <div className="step-explanation">
        <p>港同士は<strong>航路</strong>で結ばれています。航路がない港へは直接移動できません。</p>
        <p>地図上で<strong>緑にハイライトされている港</strong>が移動可能な場所です。</p>
        <div className="tip-box">
          <span className="tip-icon">💡</span>
          <span>目的地をクリックすると経路が表示されます。</span>
        </div>
      </div>
    </div>
  );
};

const TurnProgressStep: React.FC = () => (
  <div className="tutorial-step">
    <div className="step-visual">
      <div className="mock-header">
        <div className="mock-turn">ターン 1/30</div>
        <div className="mock-header-buttons">
          <button className="mock-undo-btn">↩ 戻る</button>
          <button className="mock-next-btn">次のターンへ ▶</button>
        </div>
      </div>
    </div>
    <div className="step-explanation">
      <p>全ての船の行き先を決めたら<strong>「次のターンへ」</strong>をクリック！</p>
      <p>需要拠点に到着すると、<strong>対応する色の貨物が自動的に荷下ろし</strong>されます。</p>
      <p className="unload-note">例: 東京に着くと<span className="color-badge red">赤</span>の貨物だけが降ろされます</p>
      <div className="tip-box">
        <span className="tip-icon">💡</span>
        <span>「戻る」ボタンで前のターンに戻れます。失敗しても安心！</span>
      </div>
    </div>
  </div>
);

const InventoryStep: React.FC = () => (
  <div className="tutorial-step">
    <div className="step-visual">
      <div className="inventory-combined">
        {/* 都市在庫の棒グラフ */}
        <div className="mock-inventory compact">
          <div className="mock-inv-header">都市在庫パネル</div>
          <div className="mock-inv-row safe">
            <span className="city-dot red"></span>
            <span>東京</span>
            <div className="mock-bar">
              <div className="mock-bar-fill red" style={{ width: '60%' }}></div>
            </div>
            <span>18</span>
            <span className="consume">-2</span>
          </div>
          <div className="mock-inv-row warning">
            <span className="city-dot blue"></span>
            <span>札幌</span>
            <div className="mock-bar">
              <div className="mock-bar-fill blue" style={{ width: '25%' }}></div>
            </div>
            <span>7</span>
            <span className="consume">-2</span>
          </div>
          <div className="mock-inv-row danger">
            <span className="city-dot yellow"></span>
            <span>宮崎</span>
            <div className="mock-bar">
              <div className="mock-bar-fill yellow" style={{ width: '10%' }}></div>
            </div>
            <span>3</span>
            <span className="consume">-1</span>
          </div>
          <div className="mock-inv-row safe">
            <span className="city-dot green"></span>
            <span>京都</span>
            <div className="mock-bar">
              <div className="mock-bar-fill green" style={{ width: '50%' }}></div>
            </div>
            <span>15</span>
            <span className="consume">-1</span>
          </div>
        </div>
        {/* 需要レベル表 */}
        <div className="demand-level-section">
          <div className="demand-level-title">需要レベルと消費量</div>
          <table className="demand-table">
            <thead>
              <tr>
                <th>需要Lv</th>
                <th>ターン</th>
                <th><span className="city-dot red"></span>東京</th>
                <th><span className="city-dot blue"></span>札幌</th>
                <th><span className="city-dot yellow"></span>宮崎</th>
                <th><span className="city-dot green"></span>京都</th>
              </tr>
            </thead>
            <tbody>
              <tr className="level-1">
                <td><span className="level-badge lv1">Lv1</span></td>
                <td>1〜10</td>
                <td className="consume-value">-2</td>
                <td className="consume-value">-2</td>
                <td className="consume-value low">-1</td>
                <td className="consume-value low">-1</td>
              </tr>
              <tr className="level-2">
                <td><span className="level-badge lv2">Lv2</span></td>
                <td>11〜20</td>
                <td className="consume-value">-3</td>
                <td className="consume-value">-3</td>
                <td className="consume-value">-2</td>
                <td className="consume-value">-2</td>
              </tr>
              <tr className="level-3">
                <td><span className="level-badge lv3">Lv3</span></td>
                <td>21〜30</td>
                <td className="consume-value high">-4</td>
                <td className="consume-value high">-4</td>
                <td className="consume-value">-3</td>
                <td className="consume-value">-3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div className="step-explanation">
      <p><strong>各都市の在庫はターンごとに減少</strong>します。<strong className="warning-text">在庫が0を下回るとゲームオーバー！</strong></p>
      <p>需要レベルに応じて、<strong>消費量が変化</strong>します。</p>
      <div className="status-legend">
        <div className="legend-item">
          <span className="status-dot safe"></span>安全
        </div>
        <div className="legend-item">
          <span className="status-dot warning"></span>注意（8以下）
        </div>
        <div className="legend-item">
          <span className="status-dot danger"></span>危険！（3以下）
        </div>
      </div>
      <div className="tip-box warning">
        <span className="tip-icon">⚠️</span>
        <span>東京・札幌は消費量が大きいため、優先的に補給しましょう！</span>
      </div>
    </div>
  </div>
);

const GameOverStep: React.FC = () => (
  <div className="tutorial-step">
    <div className="step-visual">
      <div className="gameover-demo">
        <div className="gameover-title">ゲーム終了条件</div>
        <div className="gameover-conditions">
          <div className="condition-item danger">
            <span className="condition-icon">💀</span>
            <span>どこかの都市の在庫が<strong>0を下回る</strong></span>
          </div>
          <div className="condition-item">
            <span className="condition-icon">🏁</span>
            <span><strong>30ターン</strong>経過（通常モード）</span>
          </div>
        </div>
      </div>
    </div>
    <div className="step-explanation">
      <p>ゲーム終了後は以下の機能が使えます：</p>
      <ul className="tutorial-tips">
        <li><strong>「結果の分析を見る」</strong>：ゲーム内で立てた計画を分析して振り返ることができます</li>
        <li><strong>「結果をつぶやく」</strong>：結果をXに投稿することができます</li>
      </ul>
      <div className="tip-box">
        <span className="tip-icon">💡</span>
        <span>何度でもプレイして、より高いスコアを目指しましょう！</span>
      </div>
    </div>
  </div>
);

const EndlessModeStep: React.FC = () => (
  <div className="tutorial-step">
    <div className="step-visual">
      <div className="endless-mode-demo">
        <div className="endless-title">
          <span className="endless-icon">∞</span>
          <span>エンドレスモード</span>
        </div>
        <div className="endless-features">
          <div className="endless-feature-item">
            <span className="feature-icon">🔄</span>
            <span>30ターン以降も<strong>在庫が切れるまで</strong>プレイ継続</span>
          </div>
          <div className="endless-feature-item">
            <span className="feature-icon">📈</span>
            <span>需要レベルは<strong>10ターンごと</strong>に上昇し続ける</span>
          </div>
          <div className="endless-feature-item">
            <span className="feature-icon">🏆</span>
            <span>より長く生き残り、<strong>ハイスコア</strong>を目指そう！</span>
          </div>
        </div>
        <div className="endless-demand-table">
          <div className="endless-demand-title">需要レベルの上昇（エンドレスモード）</div>
          <div className="endless-demand-list">
            <span className="demand-item"><span className="level-badge lv1">Lv1</span> 1〜10ターン</span>
            <span className="demand-item"><span className="level-badge lv2">Lv2</span> 11〜20ターン</span>
            <span className="demand-item"><span className="level-badge lv3">Lv3</span> 21〜30ターン</span>
            <span className="demand-item"><span className="level-badge lv4">Lv4</span> 31〜40ターン</span>
            <span className="demand-item endless-dots">...</span>
          </div>
        </div>
      </div>
    </div>
    <div className="step-explanation">
      <p>エンドレスモードは<strong>腕試し用</strong>のモードです。</p>
      <p>需要レベルが上がるほど消費量が増え、難易度が上昇します。</p>
      <div className="tip-box warning">
        <span className="tip-icon">⚠️</span>
        <span>Lv4以降は消費量がさらに増加！計画的な配船が必須です。</span>
      </div>
    </div>
  </div>
);

const TUTORIAL_STEPS = [
  { title: 'ゲーム目標', component: GoalStep },
  { title: '画面の見方', component: ScreenLayoutStep },
  { title: '都市在庫に注意！', component: InventoryStep },
  { title: '供給拠点', component: SupplyPortStep },
  { title: 'STEP 1: 船を選ぶ', component: ShipSelectStep },
  { title: 'STEP 2: 貨物を積む', component: InteractiveCargoStep },
  { title: 'STEP 3: 行き先を選ぶ', component: DestinationStep },
  { title: 'STEP 4: ターンを進める', component: TurnProgressStep },
  { title: 'ゲーム終了', component: GameOverStep },
  { title: 'エンドレスモード', component: EndlessModeStep },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const step = TUTORIAL_STEPS[currentStep];
  const StepComponent = step.component;

  return (
    <div className="tutorial-modal-overlay" onClick={handleClose}>
      <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tutorial-header">
          <h2>{step.title}</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="tutorial-content">
          <StepComponent />
        </div>

        <div className="tutorial-footer">
          <div className="step-dots">
            {TUTORIAL_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`step-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                onClick={() => setCurrentStep(idx)}
              />
            ))}
          </div>
          <div className="tutorial-nav">
            <button className="nav-btn prev" onClick={handlePrev} disabled={currentStep === 0}>
              ◀ 前へ
            </button>
            {currentStep < TUTORIAL_STEPS.length - 1 ? (
              <button className="nav-btn next" onClick={handleNext}>
                次へ ▶
              </button>
            ) : (
              <button className="nav-btn start" onClick={handleClose}>
                ゲームを始める！
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
