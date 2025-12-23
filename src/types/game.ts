// 貨物の色
export type CargoColor = 'red' | 'blue' | 'yellow' | 'green';

// 港のID
export type PortId = 'TKO' | 'SAP' | 'MYZ' | 'KYT' | 'OKN' | 'RUS' | 'KOR' | 'TAW' | 'PHL' | 'HKG' | 'GUM' | 'PLW' | 'PNG' | 'OGS' | 'VNM' | 'IDN' | 'MTR' | 'SGP' | 'SKH' | 'AUS' | 'BGD';

// 船のタイプ
export type ShipType = 'large' | 'medium' | 'small';

// 港の種類
export type PortType = 'demand' | 'supply';

// 港の情報
export interface Port {
  id: PortId;
  name: string;
  nameJp: string;
  type: PortType;
  position: { lat: number; lng: number }; // 緯度経度
  cargoStock: Record<CargoColor, number>; // 港の貨物在庫
  demandColor?: CargoColor; // 需要拠点の場合、消費する貨物の色
  supplyPerTurn?: Record<CargoColor, number>; // 供給拠点の場合、毎ターンの生成量
}

// 航路の情報
export interface Route {
  from: PortId;
  to: PortId;
  distance: number;
}

// 船の積載状態
export interface ShipCargo {
  color: CargoColor;
  quantity: number;
}

// 船の状態
export type ShipStatus = 'docked' | 'sailing';

// 船の情報
export interface Ship {
  id: string;
  type: ShipType;
  name: string;
  capacity: number;
  speed: number;
  maxColors: number; // 積載可能な色の数
  status: ShipStatus;
  currentPort?: PortId; // 停泊中の場合
  cargo: ShipCargo[];
  // 航行中の情報
  sailingFrom?: PortId;
  sailingTo?: PortId;
  remainingTurns?: number;
  totalTurns?: number;
}

// 都市在庫（需要拠点の在庫状況）
export interface CityInventory {
  portId: PortId;
  color: CargoColor;
  stock: number;
}

// 需要レベル
export type DemandLevel = 1 | 2 | 3;

// 需要テーブル
export interface DemandTable {
  level: DemandLevel;
  turnRange: [number, number];
  demand: Record<PortId, number>;
}

// ゲームの状態
export type GameStatus = 'playing' | 'gameover' | 'cleared';

// ゲームログのエントリ
export interface GameLogEntry {
  turn: number;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
}

// ゲーム全体の状態
export interface GameState {
  turn: number;
  maxTurns: number;
  status: GameStatus;
  demandLevel: DemandLevel;
  ports: Record<PortId, Port>;
  ships: Ship[];
  cityInventories: CityInventory[];
  routes: Route[];
  logs: GameLogEntry[];
  score: number;
}

// プレイヤーの行動
export interface LoadCargoAction {
  type: 'load';
  shipId: string;
  color: CargoColor;
  quantity: number;
}

export interface SailAction {
  type: 'sail';
  shipId: string;
  destination: PortId;
}

export type PlayerAction = LoadCargoAction | SailAction;

// ゲーム分析用のターンごとのスナップショット
export interface TurnSnapshot {
  turn: number;
  cityInventories: { portId: PortId; stock: number }[];
  ships: {
    id: string;
    cargoCount: number;
    cargoByColor: Record<CargoColor, number>; // 色別の積載量
    location: PortId | null;
    sailingTo: PortId | null;
  }[];
  score: number;
}
