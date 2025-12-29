import React, { useState, useCallback, useMemo, useRef } from 'react';
import { GameMap } from './GameMap';
import { GanttChart } from './GanttChart';
import { InfoPanel } from './InfoPanel';
import { TutorialModal } from './TutorialModal';
import { GameAnalysis } from './GameAnalysis';
import { useGameState } from '../hooks/useGameState';
import type { PortId, CargoColor, GameMode } from '../types/game';
import './Game.css';

// 船の操作順序
const SHIP_ORDER = ['large', 'medium', 'small'] as const;

interface GameProps {
  gameMode?: GameMode;
  onReturnToStart?: () => void;
}

export const Game: React.FC<GameProps> = ({ gameMode = 'normal', onReturnToStart }) => {
  const {
    gameState,
    stateHistory,
    loadCargo,
    returnCargo,
    unloadCargo,
    sail,
    nextTurn,
    undoTurn,
    canUndo,
    resetGame,
    getAdjacentPorts,
    getShipRemainingCapacity,
    canLoadColor,
  } = useGameState(gameMode);

  // 現在操作中の船のインデックス（大型→中型→小型の順）
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  // 各船の予約された行き先（shipId -> portId）
  const [plannedDestinations, setPlannedDestinations] = useState<Record<string, PortId>>({});
  // undo用に予約履歴を保持（全履歴）
  const [, setDestinationsHistory] = useState<Record<string, PortId>[]>([]);
  // ダブルクリック防止用のフラグ
  const isProcessingRef = useRef(false);
  // ヘルプモーダル表示状態
  const [showHelp, setShowHelp] = useState(false);
  // 分析画面の表示状態
  const [showAnalysis, setShowAnalysis] = useState(false);

  // 現在操作中の船を取得
  const currentShip = useMemo(() => {
    const shipId = SHIP_ORDER[currentShipIndex];
    return gameState.ships.find(s => s.id === shipId) || null;
  }, [gameState.ships, currentShipIndex]);

  // 到達可能な港
  const reachablePorts = useMemo(() => {
    if (!currentShip || currentShip.status !== 'docked' || !currentShip.currentPort) {
      return [];
    }
    return getAdjacentPorts(currentShip.currentPort, currentShip);
  }, [currentShip, getAdjacentPorts]);

  // 港クリック時の処理（行き先を予約）
  const handlePortClick = useCallback((portId: PortId) => {
    // 到達可能な港をクリックした場合は行き先を予約（即出港ではなく次ターンで出港）
    if (currentShip && currentShip.status === 'docked' && reachablePorts.includes(portId)) {
      setPlannedDestinations(prev => {
        // 同じ行き先をクリックした場合は予約解除
        if (prev[currentShip.id] === portId) {
          const { [currentShip.id]: _, ...rest } = prev;
          return rest;
        }
        // 新しい行き先を予約
        return { ...prev, [currentShip.id]: portId };
      });
    }
  }, [currentShip, reachablePorts]);

  // 貨物積み込み（1個ずつ）- ダブルクリック防止付き
  const handleLoadCargo = useCallback((color: CargoColor) => {
    if (isProcessingRef.current) {
      return;
    }
    if (!currentShip) {
      return;
    }
    isProcessingRef.current = true;
    loadCargo(currentShip.id, color, 1);
    // 300msのクールダウン
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 300);
  }, [currentShip, loadCargo]);

  // 貨物を戻す（1個ずつ）- ダブルクリック防止付き
  const handleReturnCargo = useCallback((color: CargoColor) => {
    if (isProcessingRef.current) {
      return;
    }
    if (!currentShip) {
      return;
    }
    isProcessingRef.current = true;
    returnCargo(currentShip.id, color);
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 300);
  }, [currentShip, returnCargo]);

  // 貨物荷下ろし
  const handleUnloadCargo = useCallback(() => {
    if (currentShip) {
      unloadCargo(currentShip.id);
    }
  }, [currentShip, unloadCargo]);

  // 次の船へ
  const handleNextShip = useCallback(() => {
    if (currentShipIndex < SHIP_ORDER.length - 1) {
      setCurrentShipIndex(currentShipIndex + 1);
    }
  }, [currentShipIndex]);

  // 前の船へ
  const handlePrevShip = useCallback(() => {
    if (currentShipIndex > 0) {
      setCurrentShipIndex(currentShipIndex - 1);
    }
  }, [currentShipIndex]);

  // ターン終了
  const handleNextTurn = useCallback(() => {
    // 現在の予約を履歴に保存（全履歴を保持）
    setDestinationsHistory(prevHistory => {
      return [...prevHistory, { ...plannedDestinations }];
    });

    // 予約された行き先に向けて全ての船を出港させる
    Object.entries(plannedDestinations).forEach(([shipId, destination]) => {
      const ship = gameState.ships.find(s => s.id === shipId);
      if (ship && ship.status === 'docked') {
        sail(shipId, destination);
      }
    });
    // 予約をクリア
    setPlannedDestinations({});
    nextTurn();
    setCurrentShipIndex(0);
  }, [nextTurn, plannedDestinations, gameState.ships, sail]);

  // 前のターンに戻る
  const handleUndo = useCallback(() => {
    if (undoTurn()) {
      // 予約履歴から復元
      setDestinationsHistory(prevHistory => {
        if (prevHistory.length > 0) {
          const previousDestinations = prevHistory[prevHistory.length - 1];
          setPlannedDestinations(previousDestinations);
          return prevHistory.slice(0, -1);
        }
        setPlannedDestinations({});
        return prevHistory;
      });
      setCurrentShipIndex(0);
    }
  }, [undoTurn]);

  // ゲームリセット（履歴もクリア）
  const handleReset = useCallback(() => {
    resetGame();
    setPlannedDestinations({});
    setDestinationsHistory([]);
    setCurrentShipIndex(0);
  }, [resetGame]);

  // 現在の港の情報
  const currentPort = currentShip?.currentPort ? gameState.ports[currentShip.currentPort] : null;

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

  // 港の在庫を箱の配列として表示
  const renderCargoBoxes = (stock: Record<CargoColor, number>, isLoading: boolean) => {
    const boxes: { color: CargoColor; index: number }[] = [];
    // 整数部分のみ表示（小数は累積中）
    (['red', 'blue', 'yellow', 'green'] as CargoColor[]).forEach(color => {
      const integerStock = Math.floor(stock[color]);
      for (let i = 0; i < integerStock; i++) {
        boxes.push({ color, index: i });
      }
    });

    return (
      <div className="cargo-boxes">
        {boxes.map((box, idx) => {
          const canLoad = isLoading &&
            currentShip &&
            getShipRemainingCapacity(currentShip) > 0 &&
            canLoadColor(currentShip, box.color);
          return (
            <div
              key={`${box.color}-${box.index}-${idx}`}
              className={`cargo-box ${box.color} ${canLoad ? 'clickable' : 'disabled'}`}
              style={{ backgroundColor: getCargoColor(box.color), userSelect: 'none' }}
              onPointerDown={(e) => {
                if (e.button !== 0) return; // 左クリックのみ
                e.preventDefault();
                e.stopPropagation();
                (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                if (canLoad) handleLoadCargo(box.color);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              title={canLoad ? 'クリックして積み込み' : ''}
            />
          );
        })}
        {boxes.length === 0 && <span className="no-cargo">在庫なし</span>}
      </div>
    );
  };

  // 船の積荷を箱として表示（クリックで戻せる）
  const renderShipCargoBoxes = (canReturn: boolean) => {
    if (!currentShip) return null;
    const boxes: { color: CargoColor; index: number }[] = [];
    currentShip.cargo.forEach(c => {
      for (let i = 0; i < c.quantity; i++) {
        boxes.push({ color: c.color, index: i });
      }
    });

    return (
      <div className="ship-cargo-boxes">
        {boxes.map((box, idx) => (
          <div
            key={`ship-${box.color}-${box.index}-${idx}`}
            className={`cargo-box ${box.color} ${canReturn ? 'returnable' : ''}`}
            style={{ backgroundColor: getCargoColor(box.color), userSelect: 'none' }}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              e.stopPropagation();
              (e.target as HTMLElement).releasePointerCapture(e.pointerId);
              if (canReturn) handleReturnCargo(box.color);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            title={canReturn ? 'クリックして港に戻す' : ''}
          />
        ))}
        {/* 空きスロット */}
        {currentShip && Array.from({ length: currentShip.capacity - boxes.length }).map((_, idx) => (
          <div key={`empty-${idx}`} className="cargo-box empty" />
        ))}
      </div>
    );
  };

  // 全船の予約ルート情報（地図上に表示するため）
  const plannedRoutes = useMemo(() => {
    const routes: Array<{ shipId: string; from: PortId; to: PortId }> = [];
    Object.entries(plannedDestinations).forEach(([shipId, destination]) => {
      const ship = gameState.ships.find(s => s.id === shipId);
      if (ship && ship.status === 'docked' && ship.currentPort) {
        routes.push({
          shipId,
          from: ship.currentPort,
          to: destination,
        });
      }
    });
    return routes;
  }, [plannedDestinations, gameState.ships]);

  // 現在選択中の船の予約ルート（従来のselectedRouteと互換性のため）
  const selectedRoute = useMemo(() => {
    if (!currentShip?.currentPort) return null;
    const destination = plannedDestinations[currentShip.id];
    if (!destination) return null;
    return {
      from: currentShip.currentPort,
      to: destination,
    };
  }, [currentShip?.currentPort, currentShip?.id, plannedDestinations]);

  // 供給拠点かどうか
  const isAtSupplyPort = currentPort?.type === 'supply';

  return (
    <div className="game-container">
      {/* ヘッダー */}
      <header className="game-header">
        <h1>Renom Vessel Game</h1>
        <div className="header-info">
          <span className="turn-info">
            ターン {gameState.turn}{gameState.gameMode === 'normal' ? `/${gameState.maxTurns}` : ''}
          </span>
          {gameState.gameMode === 'endless' && (
            <span className="endless-badge">ENDLESS</span>
          )}
          <span className={`demand-level level-${Math.min(gameState.demandLevel, 3)}`}>需要 Lv{gameState.demandLevel}</span>
          <span className="score-info">スコア: {gameState.score}</span>
        </div>
        <div className="header-controls">
          <button
            className="undo-btn"
            onClick={handleUndo}
            disabled={!canUndo || gameState.status !== 'playing'}
            title="前のターンに戻る"
          >
            ↩ 戻る
          </button>
          <button
            className="next-turn-btn"
            onClick={handleNextTurn}
            disabled={gameState.status !== 'playing'}
          >
            次のターンへ
          </button>
          <button className="reset-btn" onClick={handleReset}>
            リセット
          </button>
          {onReturnToStart && (
            <button className="home-btn" onClick={onReturnToStart}>
              スタートへ
            </button>
          )}
          <button className="help-btn" onClick={() => setShowHelp(true)}>
            ?
          </button>
        </div>
      </header>

      <div className="game-content">
        {/* 左側：地図 */}
        <div className="map-section">
          <GameMap
            gameState={gameState}
            onPortClick={handlePortClick}
            selectedPortId={currentShip?.currentPort || null}
            selectedShipId={currentShip?.id || null}
            highlightedPorts={reachablePorts}
            selectedRoute={selectedRoute}
            plannedRoutes={plannedRoutes}
          />
        </div>

        {/* 右側：情報パネル */}
        <div className="right-section">
          {/* 船積載情報 */}
          <div className="gantt-section">
            <GanttChart gameState={gameState} currentShipId={currentShip?.id} />
          </div>

          {/* 船操作パネル */}
          {currentShip && currentShip.status === 'docked' && (
            <div className="ship-control-section">
              <div className="ship-nav">
                <button
                  onClick={handlePrevShip}
                  disabled={currentShipIndex === 0}
                  className="nav-btn"
                >
                  ◀ 前
                </button>
                <span className="current-ship-name">{currentShip.name}</span>
                <button
                  onClick={handleNextShip}
                  disabled={currentShipIndex === SHIP_ORDER.length - 1}
                  className="nav-btn"
                >
                  次 ▶
                </button>
              </div>

              <div className="ship-status">
                <span className="location">現在地: {currentPort?.nameJp || '不明'}</span>
                <span className="capacity">
                  積載: {currentShip.cargo.reduce((sum, c) => sum + c.quantity, 0)}/{currentShip.capacity}
                </span>
                <span className="colors">積載可能色数: {currentShip.maxColors}</span>
              </div>

              {/* 予約された行き先表示 */}
              {plannedDestinations[currentShip.id] && (
                <div className="planned-destination">
                  <span className="destination-label">
                    次ターンの行き先: <strong>{gameState.ports[plannedDestinations[currentShip.id]].nameJp}</strong>
                  </span>
                  <button
                    className="cancel-destination-btn"
                    onClick={() => setPlannedDestinations(prev => {
                      const { [currentShip.id]: _, ...rest } = prev;
                      return rest;
                    })}
                  >
                    キャンセル
                  </button>
                </div>
              )}
              {/* 船の積荷（箱表示） */}
              <div className="ship-cargo-section">
                <h4>船の積荷{isAtSupplyPort && currentShip.cargo.length > 0 ? '（クリックで戻す）' : ''}</h4>
                {renderShipCargoBoxes(isAtSupplyPort)}
              </div>

              {/* 積み込みUI（供給拠点の場合） */}
              {currentPort?.type === 'supply' && (
                <div className="load-section">
                  <h4>港の在庫（クリックで積み込み）</h4>
                  {renderCargoBoxes(currentPort.cargoStock, true)}
                </div>
              )}

              {/* 荷下ろしUI（需要拠点の場合） */}
              {currentPort?.type === 'demand' && currentShip.cargo.length > 0 && (
                <div className="unload-section">
                  <button className="unload-btn" onClick={handleUnloadCargo}>
                    荷下ろし（{currentPort.demandColor}の貨物を降ろす）
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 航海中の船の情報 */}
          {currentShip && currentShip.status === 'sailing' && (
            <div className="ship-control-section sailing">
              <div className="ship-nav">
                <button
                  onClick={handlePrevShip}
                  disabled={currentShipIndex === 0}
                  className="nav-btn"
                >
                  ◀ 前
                </button>
                <span className="current-ship-name">{currentShip.name}</span>
                <button
                  onClick={handleNextShip}
                  disabled={currentShipIndex === SHIP_ORDER.length - 1}
                  className="nav-btn"
                >
                  次 ▶
                </button>
              </div>
              <div className="sailing-info">
                <p>航海中: {currentShip.sailingTo && gameState.ports[currentShip.sailingTo].nameJp}へ</p>
                <p>残り {currentShip.remainingTurns} ターン</p>
              </div>
              <div className="ship-cargo-section">
                <h4>船の積荷</h4>
                {renderShipCargoBoxes(false)}
              </div>
            </div>
          )}

          {/* 情報パネル */}
          <div className="info-section">
            <InfoPanel gameState={gameState} plannedDestinations={plannedDestinations} />
          </div>
        </div>
      </div>

      {/* ゲーム終了オーバーレイ */}
      {gameState.status !== 'playing' && !showAnalysis && (
        <div className="game-end-overlay">
          <div className={`game-end-modal ${gameState.status}`}>
            <h2>{gameState.status === 'cleared' ? 'GAME CLEAR!' : 'GAME OVER'}</h2>
            <p className="end-message">
              {gameState.status === 'cleared'
                ? '30ターン生き残りました！素晴らしい配船計画です！'
                : gameState.gameMode === 'endless'
                  ? `${gameState.turn - 1}ターン生き残りました！在庫が枯渇してしまいました...`
                  : '在庫が枯渇してしまいました...'}
            </p>
            <div className="end-stats">
              <div className="stat">
                <span className="stat-label">到達ターン</span>
                <span className="stat-value">{gameState.turn - 1}</span>
              </div>
              <div className="stat">
                <span className="stat-label">最終スコア</span>
                <span className="stat-value">{gameState.score}</span>
              </div>
            </div>
            <div className="end-buttons">
              {gameState.status === 'gameover' && canUndo && (
                <button className="undo-to-last-btn" onClick={handleUndo}>
                  ↩ 前のターンに戻る
                </button>
              )}
              <button className="analysis-btn" onClick={() => setShowAnalysis(true)}>
                結果の分析を見る
              </button>
              <button className="retry-btn" onClick={handleReset}>
                もう一度プレイ
              </button>
              <button
                className="tweet-btn"
                onClick={() => {
                  const modeText = gameState.gameMode === 'endless' ? 'エンドレスモードで' : '';
                  const text = `Renom Vessel Game${modeText}${gameState.turn - 1}ターン生き残り、${gameState.score}点を獲得しました🚢\n\n#RenomVesselGame`;
                  const url = 'https://vessel-game.vercel.app';
                  window.open(
                    `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                    '_blank'
                  );
                }}
              >
                結果をつぶやく
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分析画面 */}
      {showAnalysis && (
        <GameAnalysis
          gameState={gameState}
          history={stateHistory}
          onClose={() => setShowAnalysis(false)}
        />
      )}

      {/* ヘルプモーダル */}
      <TutorialModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* モバイル用ヘッダー */}
      <header className="mobile-header">
        <span className="mobile-title">Renom Vessel Game</span>
        <div className="mobile-stats">
          <span className="stat-turn">
            {gameState.turn}{gameState.gameMode === 'normal' ? `/${gameState.maxTurns}` : ''}
            {gameState.gameMode === 'endless' && <span className="endless-icon">∞</span>}
          </span>
          <span className="stat-level">Lv{gameState.demandLevel}</span>
          <span className="stat-score">{gameState.score}pt</span>
        </div>
        <div className="mobile-header-buttons">
          <button className="mobile-help-btn" onClick={() => setShowHelp(true)}>
            ?
          </button>
          {onReturnToStart && (
            <button className="mobile-home-btn" onClick={onReturnToStart}>
              🏠
            </button>
          )}
        </div>
      </header>

      {/* モバイル用下部パネル（船の積荷と在庫） */}
      <div className="mobile-bottom-panel">
        {currentShip && (
          <div className="mobile-ship-panel">
            <div className="ship-details">
              現在地: {currentPort?.nameJp || '移動中'}
              （積載: {currentShip.cargo.reduce((sum, c) => sum + c.quantity, 0)}/{currentShip.capacity}）
            </div>
            {/* 貨物表示 */}
            <div className="mobile-cargo-section">
              <div className="section-header">船の積荷{isAtSupplyPort ? '（タップで戻す）' : ''}</div>
              <div className="mobile-cargo-grid">
                {(() => {
                  const slots: { color: CargoColor | 'empty' }[] = [];
                  currentShip.cargo.forEach(c => {
                    for (let i = 0; i < c.quantity; i++) {
                      slots.push({ color: c.color });
                    }
                  });
                  while (slots.length < currentShip.capacity) {
                    slots.push({ color: 'empty' });
                  }
                  return slots.map((slot, i) => (
                    <div
                      key={i}
                      className={`cargo-slot ${slot.color}`}
                      onClick={() => slot.color !== 'empty' && isAtSupplyPort && returnCargo(currentShip.id, slot.color as CargoColor)}
                    />
                  ));
                })()}
              </div>
            </div>
            {/* 港の在庫（供給拠点の場合） */}
            {isAtSupplyPort && currentPort && (
              <div className="mobile-cargo-section">
                <div className="section-header">港の在庫（タップで積む）</div>
                <div className="mobile-cargo-grid">
                  {(['red', 'blue', 'yellow', 'green'] as CargoColor[]).map((color) => {
                    const stock = currentPort.cargoStock[color] || 0;
                    return [...Array(Math.floor(stock))].map((_, i) => (
                      <div
                        key={`${color}-${i}`}
                        className={`cargo-slot ${color} clickable`}
                        onClick={() => canLoadColor(currentShip, color) && loadCargo(currentShip.id, color, 1)}
                      />
                    ));
                  })}
                </div>
              </div>
            )}
            {/* 都市在庫状況 */}
            <div className="mobile-city-inventory">
              <div className="city-inventory-row">
                {gameState.cityInventories.map((inv) => {
                  const city = gameState.ports[inv.portId];
                  const demand = inv.portId === 'TKO' || inv.portId === 'SAP'
                    ? gameState.demandLevel + 1
                    : gameState.demandLevel;
                  const stockPercent = Math.min(100, (inv.stock / 30) * 100);
                  // 入荷予定量を計算（この都市に向かっている船の該当色貨物）
                  const incoming = gameState.ships.reduce((sum, ship) => {
                    // 航海中でこの都市に向かっている船
                    if (ship.status === 'sailing' && ship.sailingTo === inv.portId) {
                      const cargoOfColor = ship.cargo.find(c => c.color === inv.color);
                      return sum + (cargoOfColor?.quantity || 0);
                    }
                    // 停泊中でこの都市に行き先予約されている船
                    if (ship.status === 'docked' && plannedDestinations[ship.id] === inv.portId) {
                      const cargoOfColor = ship.cargo.find(c => c.color === inv.color);
                      return sum + (cargoOfColor?.quantity || 0);
                    }
                    return sum;
                  }, 0);
                  return (
                    <div key={inv.portId} className={`city-inv-item ${inv.color}`}>
                      <div className="city-inv-header">
                        <span className="city-inv-name">{city?.nameJp?.slice(0, 2)}</span>
                        <span className="city-inv-numbers">
                          <span className="city-inv-stock">{inv.stock}</span>
                          {incoming > 0 && <span className="city-inv-incoming">+{incoming}</span>}
                          <span className="city-inv-demand">-{demand}</span>
                        </span>
                      </div>
                      <div className="city-inv-bar">
                        <div
                          className="city-inv-bar-fill"
                          style={{ width: `${stockPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* モバイル用アクションバー */}
      <div className="mobile-action-bar">
        <div className="ship-selector">
          <button
            className="ship-nav-btn"
            onClick={() => setCurrentShipIndex((prev) => (prev - 1 + SHIP_ORDER.length) % SHIP_ORDER.length)}
          >
            ◀
          </button>
          <div className="current-ship">
            <span className="ship-icon">
              {currentShip?.type === 'large' ? '🚢' : currentShip?.type === 'medium' ? '⛵' : '🛥️'}
            </span>
            <span className="ship-name">{currentShip?.name}</span>
          </div>
          <button
            className="ship-nav-btn"
            onClick={() => setCurrentShipIndex((prev) => (prev + 1) % SHIP_ORDER.length)}
          >
            ▶
          </button>
        </div>
        <div className="action-buttons">
          <button
            className="mobile-undo-btn"
            onClick={handleUndo}
            disabled={!canUndo}
          >
            ↩
          </button>
          <button
            className="mobile-next-turn-btn"
            onClick={handleNextTurn}
            disabled={gameState.status !== 'playing'}
          >
            次のターン
          </button>
        </div>
      </div>
    </div>
  );
};
