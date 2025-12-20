import React, { useState } from 'react';
import './TutorialModal.css';

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
        <p><strong>実際に操作してみましょう！</strong></p>
        <ul className="tutorial-tips">
          <li>港の在庫（下の色付きボックス）をクリック → 船に積む</li>
          <li>船の積荷（上の色付きボックス）をクリック → 港に戻す</li>
        </ul>
        <div className="tip-box">
          <span className="tip-icon">💡</span>
          <span>中型船は2色まで積載可能！大型船・小型船は1色のみです。</span>
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

const GoalStep: React.FC = () => (
  <div className="tutorial-goal">
    <div className="goal-banner">
      <span className="goal-icon">🎯</span>
      <span className="goal-text">30ターン生き残れ！</span>
    </div>
    <p className="goal-description">
      日本の4都市（東京・札幌・宮崎・石川）に貨物を届け続けましょう。
      <br />
      <strong className="warning-text">都市の在庫が0になるとゲームオーバー！</strong>
    </p>
    <div className="city-preview">
      <div className="city-item">
        <span className="city-dot red"></span>
        <span>東京</span>
      </div>
      <div className="city-item">
        <span className="city-dot blue"></span>
        <span>札幌</span>
      </div>
      <div className="city-item">
        <span className="city-dot yellow"></span>
        <span>宮崎</span>
      </div>
      <div className="city-item">
        <span className="city-dot green"></span>
        <span>石川</span>
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
      <p>または<strong>地図上の船アイコン</strong>を直接クリックしても選択できます。</p>
      <div className="tip-box">
        <span className="tip-icon">💡</span>
        <span>1ターンで全ての船を操作できます。全船の行き先を決めてからターンを進めましょう！</span>
      </div>
    </div>
    <div className="ship-list-preview">
      <div className="ship-preview-item">
        <span>🚢</span>
        <span>大型船 - 積載24個/速度1</span>
      </div>
      <div className="ship-preview-item">
        <span>⛵</span>
        <span>中型船 - 積載18個/速度2</span>
      </div>
      <div className="ship-preview-item">
        <span>🛥️</span>
        <span>小型船 - 積載12個/速度3</span>
      </div>
    </div>
  </div>
);

// 行き先選択ステップ（静的な説明）
// 実際のゲームの航路構造を反映
const DestinationStep: React.FC = () => (
  <div className="tutorial-step">
    <div className="step-visual">
      <div className="destination-demo">
        <div className="demo-map-image">
          <div className="demo-port-layout">
            {/* 航路の線（実際のROUTESに基づく） */}
            <svg className="demo-routes-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* 韓国からの航路（船の現在地） */}
              <line x1="22" y1="42" x2="70" y2="20" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3,3" /> {/* KOR-SAP */}
              <line x1="22" y1="42" x2="58" y2="48" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3,3" /> {/* KOR-ISK */}
              <line x1="22" y1="42" x2="55" y2="70" stroke="#ff69b4" strokeWidth="2" /> {/* KOR-MYZ: 選択された行き先 */}
              <line x1="22" y1="42" x2="12" y2="25" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3,3" /> {/* KOR-RUS */}
              <line x1="22" y1="42" x2="15" y2="55" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3,3" /> {/* KOR-CHN */}
              {/* その他の航路（参考表示） */}
              <line x1="12" y1="25" x2="70" y2="20" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,4" /> {/* RUS-SAP */}
              <line x1="12" y1="25" x2="58" y2="48" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,4" /> {/* RUS-ISK */}
              <line x1="15" y1="55" x2="55" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,4" /> {/* CHN-MYZ */}
              <line x1="70" y1="20" x2="58" y2="48" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,4" /> {/* SAP-ISK */}
              <line x1="70" y1="20" x2="78" y2="45" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,4" /> {/* SAP-TKO */}
              <line x1="78" y1="45" x2="55" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,4" /> {/* TKO-MYZ */}
            </svg>

            {/* 供給拠点 */}
            <div className="demo-port-item supply" style={{ top: '25%', left: '12%' }}>
              <div className="port-circle gray"></div>
              <span>ロシア</span>
            </div>
            <div className="demo-port-item supply has-ship" style={{ top: '42%', left: '22%' }}>
              <div className="port-circle gray"></div>
              <span>韓国</span>
            </div>
            <div className="demo-port-item supply" style={{ top: '55%', left: '15%' }}>
              <div className="port-circle gray"></div>
              <span>上海</span>
            </div>

            {/* 需要拠点（日本の都市）- 韓国から直接行ける港はglow */}
            <div className="demo-port-item demand reachable" style={{ top: '20%', left: '70%' }}>
              <div className="port-circle blue glow"></div>
              <span>札幌</span>
            </div>
            <div className="demo-port-item demand" style={{ top: '45%', left: '78%' }}>
              <div className="port-circle red"></div>
              <span>東京</span>
            </div>
            <div className="demo-port-item demand reachable" style={{ top: '48%', left: '58%' }}>
              <div className="port-circle green glow"></div>
              <span>石川</span>
            </div>
            <div className="demo-port-item demand reachable selected" style={{ top: '70%', left: '55%' }}>
              <div className="port-circle yellow glow"></div>
              <span>宮崎</span>
              <span className="destination-badge">行き先</span>
            </div>

            {/* 船のアイコン（韓国に配置） */}
            <div className="demo-ship-marker" style={{ top: '30%', left: '22%' }}>
              ⛵
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="step-explanation">
      <p><strong>緑色に光っている港</strong>が移動可能な場所です。</p>
      <p>クリックすると<strong>ピンク色の線</strong>で行き先が表示されます。</p>
      <div className="route-info">
        <span className="route-example">韓国 → 札幌・石川・宮崎 へ直接移動可能</span>
      </div>
      <div className="tip-box">
        <span className="tip-icon">💡</span>
        <span>速度が高い船ほど遠くまで1ターンで移動できます！</span>
      </div>
    </div>
  </div>
);

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
      <div className="mock-turn-flow">
        <div className="flow-step">
          <span className="flow-num">1</span>
          <span>都市の在庫消費</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-step">
          <span className="flow-num">2</span>
          <span>船が移動</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-step">
          <span className="flow-num">3</span>
          <span>自動荷下ろし</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-step">
          <span className="flow-num">4</span>
          <span>供給拠点に貨物生成</span>
        </div>
      </div>
    </div>
    <div className="step-explanation">
      <p>全ての船の行き先を決めたら<strong>「次のターンへ」</strong>をクリック！</p>
      <p>需要拠点に到着すると<strong>自動的に荷下ろし</strong>されます。</p>
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
      <div className="mock-inventory">
        <div className="mock-inv-header">都市在庫</div>
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
      </div>
    </div>
    <div className="step-explanation">
      <p>右下の<strong>都市在庫パネル</strong>で各都市の状況を確認しましょう。</p>
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
        <span>赤・青は消費が大きい（-2〜-4）ので優先的に補給を！</span>
      </div>
    </div>
  </div>
);

const ItemsStep: React.FC = () => (
  <div className="tutorial-step">
    <div className="step-visual">
      <div className="mock-items">
        <div className="mock-item-btn">
          <span>📦</span>
          <span>緊急生産</span>
        </div>
        <div className="mock-item-btn">
          <span>❄️</span>
          <span>特別休日</span>
        </div>
        <div className="mock-item-btn">
          <span>⚡</span>
          <span>瞬間移動</span>
        </div>
      </div>
    </div>
    <div className="step-explanation">
      <p><strong>アイテム</strong>を使ってピンチを乗り越えましょう！</p>
      <ul className="item-list">
        <li><strong>📦 緊急生産</strong> - 供給拠点の在庫を満タンに</li>
        <li><strong>❄️ 特別休日</strong> - 1ターン消費をストップ</li>
        <li><strong>⚡ 瞬間移動</strong> - 船を任意の港へワープ</li>
      </ul>
      <div className="tip-box">
        <span className="tip-icon">💡</span>
        <span>「戻る」ボタンで前のターンに戻れます！失敗しても大丈夫！</span>
      </div>
    </div>
  </div>
);

const TUTORIAL_STEPS = [
  { title: '画面の見方', component: ScreenLayoutStep },
  { title: 'ゲーム目標', component: GoalStep },
  { title: 'STEP 1: 船を選ぶ', component: ShipSelectStep },
  { title: 'STEP 2: 貨物を積む', component: InteractiveCargoStep },
  { title: 'STEP 3: 行き先を選ぶ', component: DestinationStep },
  { title: 'STEP 4: ターンを進める', component: TurnProgressStep },
  { title: '都市在庫に注意！', component: InventoryStep },
  { title: '困ったときは...', component: ItemsStep },
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
