import { useState, useCallback, useRef } from 'react';
import type {
  GameState,
  Ship,
  PortId,
  CargoColor,
  GameLogEntry,
  GameItem,
} from '../types/game';
import {
  INITIAL_PORTS,
  INITIAL_SHIPS,
  INITIAL_CITY_INVENTORIES,
  ROUTES,
  GAME_CONFIG,
  getDemandLevel,
  getDemandForTurn,
} from '../config/gameConfig';

// ディープコピーユーティリティ
function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 初期アイテム
const INITIAL_ITEMS: GameItem[] = [
  { id: 'supplyBoost', name: '緊急生産', description: '供給拠点1つの在庫を満タンに', used: false },
  { id: 'demandFreeze', name: '特別休日', description: '1ターン需要消費を停止', used: false },
  { id: 'teleport', name: '瞬間移動', description: '船1隻を任意の港へ移動', used: false },
];

// 初期ゲーム状態を生成
function createInitialGameState(): GameState {
  return {
    turn: 1,
    maxTurns: GAME_CONFIG.maxTurns,
    status: 'playing',
    demandLevel: 1,
    ports: deepCopy(INITIAL_PORTS),
    ships: deepCopy(INITIAL_SHIPS),
    cityInventories: deepCopy(INITIAL_CITY_INVENTORIES),
    routes: deepCopy(ROUTES),
    logs: [{ turn: 0, message: 'ゲーム開始！30ターン生き残れ！', type: 'info' }],
    score: 0,
    items: deepCopy(INITIAL_ITEMS),
    demandFrozenThisTurn: false,
  };
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  // undo用の履歴を保持（全履歴）
  const [stateHistory, setStateHistory] = useState<GameState[]>([]);
  // 積み込み処理の重複防止用
  const lastLoadTimeRef = useRef<number>(0);
  const lastTransactionIdRef = useRef<string>('');

  // ログを追加
  const addLog = useCallback((message: string, type: GameLogEntry['type'] = 'info') => {
    setGameState((prev) => ({
      ...prev,
      logs: [...prev.logs, { turn: prev.turn, message, type }],
    }));
  }, []);

  // 隣接する港を取得（1エッジ先のみ）
  const getDirectAdjacentPorts = useCallback(
    (portId: PortId): PortId[] => {
      const adjacent: PortId[] = [];
      for (const route of gameState.routes) {
        if (route.from === portId) adjacent.push(route.to);
        if (route.to === portId) adjacent.push(route.from);
      }
      return adjacent;
    },
    [gameState.routes]
  );

  // 指定エッジ数以内で到達可能な港を取得
  const getReachablePorts = useCallback(
    (portId: PortId, maxEdges: number): PortId[] => {
      const reachable = new Set<PortId>();
      const visited = new Set<PortId>([portId]);
      let currentLevel = [portId];

      for (let edge = 1; edge <= maxEdges; edge++) {
        const nextLevel: PortId[] = [];
        for (const current of currentLevel) {
          const adjacent = getDirectAdjacentPorts(current);
          for (const adj of adjacent) {
            if (!visited.has(adj)) {
              visited.add(adj);
              reachable.add(adj);
              nextLevel.push(adj);
            }
          }
        }
        currentLevel = nextLevel;
      }

      return Array.from(reachable);
    },
    [getDirectAdjacentPorts]
  );

  // 船が移動可能な港を取得（speedに応じたエッジ数）
  const getAdjacentPorts = useCallback(
    (portId: PortId, ship?: Ship): PortId[] => {
      const maxEdges = ship?.speed ?? 1;
      return getReachablePorts(portId, maxEdges);
    },
    [getReachablePorts]
  );

  // 航路の距離を取得
  const getRouteDistance = useCallback(
    (from: PortId, to: PortId): number | null => {
      const route = gameState.routes.find(
        (r) => (r.from === from && r.to === to) || (r.from === to && r.to === from)
      );
      return route?.distance ?? null;
    },
    [gameState.routes]
  );

  // 貨物を積み込む
  const loadCargo = useCallback(
    (shipId: string, color: CargoColor, quantity: number): boolean => {
      // トランザクションIDで重複実行を防止
      const transactionId = `load-${shipId}-${color}-${Date.now()}`;

      // 100ms以内の連続呼び出しを防止
      const now = Date.now();
      if (now - lastLoadTimeRef.current < 100) {
        return false;
      }
      lastLoadTimeRef.current = now;
      lastTransactionIdRef.current = transactionId;

      setGameState((prev) => {
        const ship = prev.ships.find((s) => s.id === shipId);
        if (!ship || ship.status !== 'docked' || !ship.currentPort) {
          return prev;
        }

        const port = prev.ports[ship.currentPort];
        // 整数部分のみ積み込み可能（小数値は累積中）
        const availableStock = Math.floor(port.cargoStock[color]);
        if (!port || availableStock < quantity) {
          return prev;
        }

        // 現在の積載量を計算
        const currentLoad = ship.cargo.reduce((sum, c) => sum + c.quantity, 0);
        if (currentLoad + quantity > ship.capacity) {
          return prev;
        }

        // 積載色数のチェック
        const currentColors = new Set(ship.cargo.map((c) => c.color));
        if (!currentColors.has(color) && currentColors.size >= ship.maxColors) {
          return prev;
        }

        // 状態を更新
        const newPorts = deepCopy(prev.ports);
        newPorts[ship.currentPort].cargoStock[color] -= quantity;

        const newShips = prev.ships.map((s) => {
          if (s.id !== shipId) return s;

          const newCargo = [...s.cargo];
          const existingCargo = newCargo.find((c) => c.color === color);
          if (existingCargo) {
            existingCargo.quantity += quantity;
          } else {
            newCargo.push({ color, quantity });
          }

          return { ...s, cargo: newCargo };
        });

        const colorName = color === 'red' ? '赤' : color === 'blue' ? '青' : color === 'yellow' ? '黄' : '緑';
        return {
          ...prev,
          ports: newPorts,
          ships: newShips,
          logs: [
            ...prev.logs,
            {
              turn: prev.turn,
              message: `${ship.name}が${colorName}貨物を${quantity}個積み込みました`,
              type: 'info',
            },
          ],
        };
      });
      return true;
    },
    []
  );

  // 船から1個の貨物を港に戻す
  const returnCargo = useCallback(
    (shipId: string, color: CargoColor): boolean => {
      // 50ms以内の連続呼び出しを防止
      const now = Date.now();
      if (now - lastLoadTimeRef.current < 50) {
        return false;
      }
      lastLoadTimeRef.current = now;

      let success = false;
      setGameState((prev) => {
        const ship = prev.ships.find((s) => s.id === shipId);
        if (!ship || ship.status !== 'docked' || !ship.currentPort) {
          return prev;
        }

        const port = prev.ports[ship.currentPort];
        if (port.type !== 'supply') {
          return prev; // 供給拠点でのみ戻せる
        }

        const cargoIndex = ship.cargo.findIndex((c) => c.color === color);
        if (cargoIndex === -1) {
          return prev;
        }

        // 状態を更新
        const newPorts = deepCopy(prev.ports);
        newPorts[ship.currentPort].cargoStock[color] += 1;

        const newShips = prev.ships.map((s) => {
          if (s.id !== shipId) return s;

          const newCargo = [...s.cargo];
          const existingCargo = newCargo.find((c) => c.color === color);
          if (existingCargo) {
            existingCargo.quantity -= 1;
            if (existingCargo.quantity <= 0) {
              return { ...s, cargo: newCargo.filter((c) => c.quantity > 0) };
            }
          }
          return { ...s, cargo: newCargo };
        });

        success = true;
        return {
          ...prev,
          ports: newPorts,
          ships: newShips,
        };
      });
      return success;
    },
    []
  );

  // 貨物を降ろす
  const unloadCargo = useCallback((shipId: string): void => {
    setGameState((prev) => {
      const ship = prev.ships.find((s) => s.id === shipId);
      if (!ship || ship.status !== 'docked' || !ship.currentPort) {
        return prev;
      }

      const port = prev.ports[ship.currentPort];
      if (port.type !== 'demand' || !port.demandColor) {
        return prev;
      }

      if (ship.cargo.length === 0) {
        return prev;
      }

      // この港が必要としている色の貨物を探す
      const cargoForCity = ship.cargo.find((c) => c.color === port.demandColor);
      if (!cargoForCity) {
        return prev; // 必要な色の貨物がない
      }

      const unloadedQuantity = cargoForCity.quantity;

      // 在庫を更新（必要な色のみ）
      const newCityInventories = prev.cityInventories.map((inv) => {
        if (inv.portId !== ship.currentPort || inv.color !== port.demandColor) return inv;
        return { ...inv, stock: inv.stock + unloadedQuantity };
      });

      // 必要な色の貨物だけを降ろす（他の色は維持）
      const newShips = prev.ships.map((s) => {
        if (s.id !== shipId) return s;
        return {
          ...s,
          cargo: s.cargo.filter((c) => c.color !== port.demandColor),
        };
      });

      return {
        ...prev,
        cityInventories: newCityInventories,
        ships: newShips,
        score: prev.score + unloadedQuantity,
        logs: [
          ...prev.logs,
          {
            turn: prev.turn,
            message: `${ship.name}が${port.nameJp}で${unloadedQuantity}個の貨物を荷下ろししました`,
            type: 'success',
          },
        ],
      };
    });
  }, []);

  // 船を出港させる
  const sail = useCallback(
    (shipId: string, destination: PortId): boolean => {
      const ship = gameState.ships.find((s) => s.id === shipId);
      if (!ship || ship.status !== 'docked' || !ship.currentPort) {
        return false;
      }

      const reachablePorts = getAdjacentPorts(ship.currentPort, ship);
      if (!reachablePorts.includes(destination)) {
        return false;
      }

      // 全ての移動は1ターンで完了（speedエッジ分まで移動可能）
      const travelTime = 1;

      setGameState((prev) => {
        const newShips = prev.ships.map((s) => {
          if (s.id !== shipId) return s;
          return {
            ...s,
            status: 'sailing' as const,
            sailingFrom: s.currentPort,
            sailingTo: destination,
            currentPort: undefined,
            remainingTurns: travelTime,
            totalTurns: travelTime,
          };
        });

        const destPort = prev.ports[destination];

        return {
          ...prev,
          ships: newShips,
          logs: [
            ...prev.logs,
            {
              turn: prev.turn,
              message: `${ship.name}が${destPort.nameJp}に向けて出港しました（${travelTime}ターン）`,
              type: 'info',
            },
          ],
        };
      });

      return true;
    },
    [gameState.ships, getAdjacentPorts, getRouteDistance]
  );

  // ターンを進める
  const nextTurn = useCallback((): void => {
    // 現在の状態を履歴に保存（全履歴を保持）
    setStateHistory((prevHistory) => {
      return [...prevHistory, deepCopy(gameState)];
    });

    setGameState((prev) => {
      if (prev.status !== 'playing') return prev;

      let newState = deepCopy(prev);
      const newLogs: GameLogEntry[] = [];
      let deliveredCargo = 0; // 今ターンで配達した貨物量

      // 1. 需要消費フェーズ（demandFrozenThisTurnがtrueなら消費しない）
      const demandLevel = getDemandLevel(prev.turn);
      if (!prev.demandFrozenThisTurn) {
        for (const inv of newState.cityInventories) {
          const demand = getDemandForTurn(prev.turn, inv.portId);
          inv.stock -= demand;

          if (inv.stock < 0) {
            // ゲームオーバー
            const port = newState.ports[inv.portId];
            newLogs.push({
              turn: prev.turn,
              message: `${port.nameJp}の在庫が枯渇しました！ゲームオーバー`,
              type: 'danger',
            });
            return {
              ...newState,
              status: 'gameover',
              logs: [...newState.logs, ...newLogs],
            };
          }

          if (inv.stock <= 5) {
            const port = newState.ports[inv.portId];
            newLogs.push({
              turn: prev.turn,
              message: `警告: ${port.nameJp}の在庫が残り${inv.stock}です！`,
              type: 'warning',
            });
          }
        }
      } else {
        // 消費抑制アイテム使用中
        newLogs.push({
          turn: prev.turn,
          message: '消費抑制により需要消費が停止しました',
          type: 'success',
        });
      }
      // demandFrozenThisTurnをリセット
      newState.demandFrozenThisTurn = false;

      // 2. 到着 & 荷下ろしフェーズ
      for (const ship of newState.ships) {
        if (ship.status === 'sailing' && ship.remainingTurns !== undefined) {
          ship.remainingTurns -= 1;

          if (ship.remainingTurns <= 0) {
            // 到着
            ship.status = 'docked';
            ship.currentPort = ship.sailingTo;
            const destPort = newState.ports[ship.sailingTo!];

            newLogs.push({
              turn: prev.turn,
              message: `${ship.name}が${destPort.nameJp}に到着しました`,
              type: 'info',
            });

            // 需要拠点なら、その拠点が必要としている色のみ自動荷下ろし
            if (destPort.type === 'demand' && destPort.demandColor && ship.cargo.length > 0) {
              const cargoForCity = ship.cargo.find((c) => c.color === destPort.demandColor);
              if (cargoForCity) {
                const inv = newState.cityInventories.find(
                  (i) => i.portId === ship.currentPort && i.color === destPort.demandColor
                );
                if (inv) {
                  inv.stock += cargoForCity.quantity;
                  deliveredCargo += cargoForCity.quantity; // 配達量をスコアに加算
                }
                newLogs.push({
                  turn: prev.turn,
                  message: `${ship.name}が${cargoForCity.quantity}個の貨物を荷下ろししました`,
                  type: 'success',
                });
                // 必要な色の貨物のみ降ろす（他の色は維持）
                ship.cargo = ship.cargo.filter((c) => c.color !== destPort.demandColor);
              }
            }

            ship.sailingFrom = undefined;
            ship.sailingTo = undefined;
            ship.remainingTurns = undefined;
            ship.totalTurns = undefined;
          }
        }
      }

      // 3. 供給生成フェーズ（各色の在庫上限は10）
      const SUPPLY_STOCK_LIMIT = 10;
      for (const portId of Object.keys(newState.ports) as PortId[]) {
        const port = newState.ports[portId];
        if (port.type === 'supply' && port.supplyPerTurn) {
          for (const color of ['red', 'blue', 'yellow', 'green'] as CargoColor[]) {
            port.cargoStock[color] = Math.min(
              port.cargoStock[color] + port.supplyPerTurn[color],
              SUPPLY_STOCK_LIMIT
            );
          }
        }
      }

      // 4. ターン更新
      const newTurn = prev.turn + 1;
      const newDemandLevel = getDemandLevel(newTurn);

      // 需要レベルアップ通知
      if (newDemandLevel > demandLevel) {
        newLogs.push({
          turn: newTurn,
          message: `需要レベルが Lv${newDemandLevel} に上昇しました！`,
          type: 'warning',
        });
      }

      // クリア判定
      if (newTurn > GAME_CONFIG.maxTurns) {
        newLogs.push({
          turn: newTurn,
          message: '30ターン生き残りました！ゲームクリア！',
          type: 'success',
        });
        return {
          ...newState,
          turn: newTurn,
          status: 'cleared',
          demandLevel: newDemandLevel,
          logs: [...newState.logs, ...newLogs],
          score: prev.score + deliveredCargo,
        };
      }

      return {
        ...newState,
        turn: newTurn,
        demandLevel: newDemandLevel,
        logs: [...newState.logs, ...newLogs],
        score: prev.score + deliveredCargo, // 配達した貨物量がスコア
      };
    });
  }, [gameState]);

  // 前のターンに戻る
  const undoTurn = useCallback((): boolean => {
    if (stateHistory.length === 0) {
      return false;
    }

    setStateHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;
      const newHistory = prevHistory.slice(0, -1);
      const previousState = prevHistory[prevHistory.length - 1];
      setGameState({
        ...previousState,
        logs: [
          ...previousState.logs,
          {
            turn: previousState.turn,
            message: '前のターンに戻りました',
            type: 'info',
          },
        ],
      });
      return newHistory;
    });

    return true;
  }, [stateHistory.length]);

  // undoが可能かどうか
  const canUndo = stateHistory.length > 0;

  // ゲームをリセット
  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setStateHistory([]);
  }, []);

  // 船の積載可能な残り容量を取得
  const getShipRemainingCapacity = useCallback((ship: Ship): number => {
    const currentLoad = ship.cargo.reduce((sum, c) => sum + c.quantity, 0);
    return ship.capacity - currentLoad;
  }, []);

  // 船が特定の色を積めるかチェック
  const canLoadColor = useCallback((ship: Ship, color: CargoColor): boolean => {
    const currentColors = new Set(ship.cargo.map((c) => c.color));
    if (currentColors.has(color)) return true;
    return currentColors.size < ship.maxColors;
  }, []);

  // アイテム: 補給船団（供給拠点の在庫を満タンに）
  const useSupplyBoost = useCallback((portId: PortId): boolean => {
    let success = false;
    setGameState((prev) => {
      const item = prev.items.find((i) => i.id === 'supplyBoost');
      if (!item || item.used) return prev;

      const port = prev.ports[portId];
      if (port.type !== 'supply') return prev;

      const SUPPLY_STOCK_LIMIT = 10;
      const newPorts = deepCopy(prev.ports);
      for (const color of ['red', 'blue', 'yellow', 'green'] as CargoColor[]) {
        if (port.supplyPerTurn && port.supplyPerTurn[color] > 0) {
          newPorts[portId].cargoStock[color] = SUPPLY_STOCK_LIMIT;
        }
      }

      const newItems = prev.items.map((i) =>
        i.id === 'supplyBoost' ? { ...i, used: true } : i
      );

      success = true;
      return {
        ...prev,
        ports: newPorts,
        items: newItems,
        logs: [
          ...prev.logs,
          {
            turn: prev.turn,
            message: `補給船団により${port.nameJp}の在庫が満タンになりました`,
            type: 'success',
          },
        ],
      };
    });
    return success;
  }, []);

  // アイテム: 消費抑制（1ターン需要消費を止める）
  const useDemandFreeze = useCallback((): boolean => {
    let success = false;
    setGameState((prev) => {
      const item = prev.items.find((i) => i.id === 'demandFreeze');
      if (!item || item.used) return prev;

      const newItems = prev.items.map((i) =>
        i.id === 'demandFreeze' ? { ...i, used: true } : i
      );

      success = true;
      return {
        ...prev,
        items: newItems,
        demandFrozenThisTurn: true,
        logs: [
          ...prev.logs,
          {
            turn: prev.turn,
            message: '消費抑制を発動！次のターン需要消費が停止します',
            type: 'success',
          },
        ],
      };
    });
    return success;
  }, []);

  // アイテム: 緊急輸送（船を任意の港へ瞬間移動）
  const useTeleport = useCallback((shipId: string, destPortId: PortId): boolean => {
    let success = false;
    setGameState((prev) => {
      const item = prev.items.find((i) => i.id === 'teleport');
      if (!item || item.used) return prev;

      const ship = prev.ships.find((s) => s.id === shipId);
      if (!ship) return prev;

      const destPort = prev.ports[destPortId];

      const newShips = prev.ships.map((s) => {
        if (s.id !== shipId) return s;
        return {
          ...s,
          status: 'docked' as const,
          currentPort: destPortId,
          sailingFrom: undefined,
          sailingTo: undefined,
          remainingTurns: undefined,
          totalTurns: undefined,
        };
      });

      const newItems = prev.items.map((i) =>
        i.id === 'teleport' ? { ...i, used: true } : i
      );

      success = true;
      return {
        ...prev,
        ships: newShips,
        items: newItems,
        logs: [
          ...prev.logs,
          {
            turn: prev.turn,
            message: `緊急輸送により${ship.name}が${destPort.nameJp}へ移動しました`,
            type: 'success',
          },
        ],
      };
    });
    return success;
  }, []);

  return {
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
    getRouteDistance,
    getShipRemainingCapacity,
    canLoadColor,
    addLog,
    useSupplyBoost,
    useDemandFreeze,
    useTeleport,
  };
}
