import type { Port, Route, Ship, DemandTable, PortId, CityInventory } from '../types/game';

// 港の初期設定（実際の緯度経度）
export const INITIAL_PORTS: Record<PortId, Port> = {
  // 需要拠点（日本側）
  TKO: {
    id: 'TKO',
    name: 'Tokyo',
    nameJp: '東京',
    type: 'demand',
    position: { lat: 35.6762, lng: 139.6503 }, // 東京湾
    cargoStock: { red: 0, blue: 0, yellow: 0, green: 0 },
    demandColor: 'red',
  },
  SAP: {
    id: 'SAP',
    name: 'Sapporo',
    nameJp: '札幌',
    type: 'demand',
    position: { lat: 43.0618, lng: 141.3545 }, // 札幌（小樽港近く）
    cargoStock: { red: 0, blue: 0, yellow: 0, green: 0 },
    demandColor: 'blue',
  },
  MYZ: {
    id: 'MYZ',
    name: 'Miyazaki',
    nameJp: '宮崎',
    type: 'demand',
    position: { lat: 31.9077, lng: 131.4202 }, // 宮崎港
    cargoStock: { red: 0, blue: 0, yellow: 0, green: 0 },
    demandColor: 'yellow',
  },
  ISK: {
    id: 'ISK',
    name: 'Ishikawa',
    nameJp: '石川',
    type: 'demand',
    position: { lat: 36.5944, lng: 136.6256 }, // 金沢港
    cargoStock: { red: 0, blue: 0, yellow: 0, green: 0 },
    demandColor: 'green',
  },
  OKN: {
    id: 'OKN',
    name: 'Okinawa',
    nameJp: '沖縄',
    type: 'supply',
    position: { lat: 26.2124, lng: 127.6809 }, // 那覇港
    // 青1
    cargoStock: { red: 0, blue: 1, yellow: 0, green: 0 },
    supplyPerTurn: { red: 0, blue: 0.5, yellow: 0, green: 0 },
  },
  // 供給拠点（海外側）
  RUS: {
    id: 'RUS',
    name: 'Russia',
    nameJp: 'ロシア',
    type: 'supply',
    position: { lat: 43.1155, lng: 131.8855 }, // ウラジオストク
    // 黄色1（北部集中）+ 赤青バラバラ1個
    cargoStock: { red: 0, blue: 1, yellow: 1, green: 0 },
    supplyPerTurn: { red: 0, blue: 0.5, yellow: 0.5, green: 0 },
  },
  KOR: {
    id: 'KOR',
    name: 'Korea',
    nameJp: '韓国',
    type: 'supply',
    position: { lat: 35.1796, lng: 129.0756 }, // 釜山
    // 赤青バラバラ
    cargoStock: { red: 1, blue: 1, yellow: 0, green: 0 },
    supplyPerTurn: { red: 0.5, blue: 0.5, yellow: 0, green: 0 },
  },
  TAW: {
    id: 'TAW',
    name: 'Taiwan',
    nameJp: '台湾',
    type: 'supply',
    position: { lat: 25.0330, lng: 121.5654 }, // 台北（基隆港）
    // 赤青バラバラ
    cargoStock: { red: 1, blue: 1, yellow: 0, green: 0 },
    supplyPerTurn: { red: 0.5, blue: 0.5, yellow: 0, green: 0 },
  },
  VNM: {
    id: 'VNM',
    name: 'Vietnam',
    nameJp: 'ベトナム',
    type: 'supply',
    position: { lat: 10.8231, lng: 106.6297 }, // ホーチミン
    // 緑1（東南アジア・オセアニア）
    cargoStock: { red: 0, blue: 0, yellow: 0, green: 1 },
    supplyPerTurn: { red: 0, blue: 0, yellow: 0, green: 0.5 },
  },
  PHL: {
    id: 'PHL',
    name: 'Philippines',
    nameJp: 'フィリピン',
    type: 'supply',
    position: { lat: 14.5995, lng: 120.9842 }, // マニラ
    // 緑1赤1
    cargoStock: { red: 1, blue: 0, yellow: 0, green: 1 },
    supplyPerTurn: { red: 0.5, blue: 0, yellow: 0, green: 0.5 },
  },
  CHN: {
    id: 'CHN',
    name: 'China',
    nameJp: '上海',
    type: 'supply',
    position: { lat: 31.2304, lng: 121.4737 }, // 上海
    // 黄色1（北部集中）+ 赤青バラバラ
    cargoStock: { red: 1, blue: 0, yellow: 1, green: 0 },
    supplyPerTurn: { red: 0.5, blue: 0, yellow: 0.5, green: 0 },
  },
  GUM: {
    id: 'GUM',
    name: 'Guam',
    nameJp: 'グアム',
    type: 'supply',
    position: { lat: 13.4443, lng: 144.7937 }, // グアム
    // 赤青バラバラ
    cargoStock: { red: 0, blue: 1, yellow: 0, green: 0 },
    supplyPerTurn: { red: 0, blue: 0.5, yellow: 0, green: 0 },
  },
  PLW: {
    id: 'PLW',
    name: 'Palau',
    nameJp: 'パラオ',
    type: 'supply',
    position: { lat: 7.5150, lng: 134.5825 }, // パラオ
    // 黄色1（北部に含む）+ 赤青バラバラ
    cargoStock: { red: 0, blue: 1, yellow: 1, green: 0 },
    supplyPerTurn: { red: 0, blue: 0.5, yellow: 0.5, green: 0 },
  },
  IDN: {
    id: 'IDN',
    name: 'Indonesia',
    nameJp: 'インドネシア',
    type: 'supply',
    position: { lat: -6.2088, lng: 106.8456 }, // ジャカルタ
    // 赤2青1
    cargoStock: { red: 2, blue: 1, yellow: 0, green: 0 },
    supplyPerTurn: { red: 1, blue: 0.5, yellow: 0, green: 0 },
  },
  PNG: {
    id: 'PNG',
    name: 'Papua New Guinea',
    nameJp: 'パプアニューギニア',
    type: 'supply',
    position: { lat: -5.5708, lng: 145.7703 }, // ラエ港
    // 緑1（東南アジア・オセアニア）
    cargoStock: { red: 0, blue: 0, yellow: 0, green: 1 },
    supplyPerTurn: { red: 0, blue: 0, yellow: 0, green: 0.5 },
  },
  OGS: {
    id: 'OGS',
    name: 'Ogasawara',
    nameJp: '小笠原',
    type: 'supply',
    position: { lat: 27.0969, lng: 142.1918 }, // 父島
    // 赤青バラバラ
    cargoStock: { red: 1, blue: 0, yellow: 0, green: 0 },
    supplyPerTurn: { red: 0.5, blue: 0, yellow: 0, green: 0 },
  },
  MTR: {
    id: 'MTR',
    name: 'Minami-Torishima',
    nameJp: '南鳥島',
    type: 'supply',
    position: { lat: 24.2867, lng: 153.9789 }, // 南鳥島
    // 緑1（東南アジア・オセアニア）
    cargoStock: { red: 0, blue: 0, yellow: 0, green: 1 },
    supplyPerTurn: { red: 0, blue: 0, yellow: 0, green: 0.5 },
  },
  SGP: {
    id: 'SGP',
    name: 'Singapore',
    nameJp: 'シンガポール',
    type: 'supply',
    position: { lat: 1.3521, lng: 103.8198 }, // シンガポール
    cargoStock: { red: 0, blue: 0, yellow: 0, green: 1 },
    supplyPerTurn: { red: 0, blue: 0, yellow: 0, green: 0.5 },
  },
  // 北側新拠点
  SKH: {
    id: 'SKH',
    name: 'Sakhalin',
    nameJp: '樺太',
    type: 'supply',
    position: { lat: 50.0, lng: 143.0 }, // 樺太（サハリン）
    cargoStock: { red: 0, blue: 0, yellow: 1, green: 0 },
    supplyPerTurn: { red: 0, blue: 0, yellow: 0.5, green: 0 },
  },
  KMC: {
    id: 'KMC',
    name: 'Kamchatka',
    nameJp: 'カムチャッカ',
    type: 'supply',
    position: { lat: 53.0, lng: 158.6 }, // カムチャッカ半島
    // 黄2赤1
    cargoStock: { red: 1, blue: 0, yellow: 2, green: 0 },
    supplyPerTurn: { red: 0.5, blue: 0, yellow: 1, green: 0 },
  },
  // 南側新拠点
  AUS: {
    id: 'AUS',
    name: 'Australia',
    nameJp: 'オーストラリア',
    type: 'supply',
    position: { lat: -16.9186, lng: 145.7781 }, // ケアンズ（クイーンズランド）
    // 緑2青2
    cargoStock: { red: 0, blue: 2, yellow: 0, green: 2 },
    supplyPerTurn: { red: 0, blue: 1, yellow: 0, green: 1 },
  },
  // インド
  IND: {
    id: 'IND',
    name: 'India',
    nameJp: 'インド',
    type: 'supply',
    position: { lat: 19.0760, lng: 72.8777 }, // ムンバイ
    // 緑2青1
    cargoStock: { red: 0, blue: 1, yellow: 0, green: 2 },
    supplyPerTurn: { red: 0, blue: 0.5, yellow: 0, green: 1 },
  },
};

// 航路の設定（全て距離1 = 1エッジ）
export const ROUTES: Route[] = [
  // 日本への航路（西側）
  { from: 'RUS', to: 'SAP', distance: 1 },
  { from: 'RUS', to: 'ISK', distance: 1 },
  { from: 'KOR', to: 'SAP', distance: 1 },
  { from: 'KOR', to: 'MYZ', distance: 1 },
  { from: 'KOR', to: 'ISK', distance: 1 },
  { from: 'CHN', to: 'MYZ', distance: 1 },
  { from: 'TAW', to: 'MYZ', distance: 1 },
  { from: 'TAW', to: 'OKN', distance: 1 },
  { from: 'PHL', to: 'OKN', distance: 1 },
  // 日本国内の航路
  { from: 'TKO', to: 'SAP', distance: 1 },
  { from: 'TKO', to: 'OKN', distance: 1 },
  { from: 'MYZ', to: 'TKO', distance: 1 },
  { from: 'MYZ', to: 'OKN', distance: 1 },
  { from: 'SAP', to: 'ISK', distance: 1 },
  // 日本への航路（太平洋側）
  { from: 'OGS', to: 'TKO', distance: 1 },
  // 供給拠点間の航路（西側）
  { from: 'RUS', to: 'KOR', distance: 1 },
  { from: 'KOR', to: 'CHN', distance: 1 },
  { from: 'CHN', to: 'TAW', distance: 1 },
  { from: 'TAW', to: 'PHL', distance: 1 },
  { from: 'TAW', to: 'VNM', distance: 1 },
  { from: 'PHL', to: 'VNM', distance: 1 },
  // 供給拠点間の航路（太平洋側）
  { from: 'OKN', to: 'OGS', distance: 1 },
  { from: 'OGS', to: 'GUM', distance: 1 },
  { from: 'GUM', to: 'PLW', distance: 1 },
  { from: 'GUM', to: 'PHL', distance: 1 },
  { from: 'PLW', to: 'PHL', distance: 1 },
  { from: 'PLW', to: 'PNG', distance: 1 },
  { from: 'IDN', to: 'PNG', distance: 1 },
  { from: 'IDN', to: 'PHL', distance: 1 },
  // 南鳥島の航路
  { from: 'MTR', to: 'SAP', distance: 1 },
  { from: 'MTR', to: 'OGS', distance: 1 },
  { from: 'MTR', to: 'GUM', distance: 1 },
  // シンガポールの航路
  { from: 'SGP', to: 'VNM', distance: 1 },
  { from: 'SGP', to: 'IDN', distance: 1 },
  // 樺太の航路（札幌とロシアに接続）
  { from: 'SKH', to: 'SAP', distance: 1 },
  { from: 'SKH', to: 'RUS', distance: 1 },
  // カムチャッカの航路（樺太に接続）
  { from: 'KMC', to: 'SKH', distance: 1 },
  // オーストラリアの航路（パプアニューギニアとインドネシアに接続）
  { from: 'AUS', to: 'PNG', distance: 1 },
  { from: 'AUS', to: 'IDN', distance: 1 },
  // インドの航路（ベトナムとシンガポールに接続）
  { from: 'IND', to: 'VNM', distance: 1 },
  { from: 'IND', to: 'SGP', distance: 1 },
];

// 船の初期設定
// speed = 1ターンに移動できるエッジ数
export const INITIAL_SHIPS: Ship[] = [
  {
    id: 'large',
    type: 'large',
    name: '大型船',
    capacity: 24, // 積載量24
    speed: 1, // 1ターンに1エッジ移動（最も遅い）
    maxColors: 1, // 1色のみ
    status: 'docked',
    currentPort: 'TKO', // 東京からスタート
    cargo: [],
  },
  {
    id: 'medium',
    type: 'medium',
    name: '中型船',
    capacity: 18, // 積載量18
    speed: 2, // 1ターンに2エッジ移動
    maxColors: 2, // 2色積載可能（唯一）
    status: 'docked',
    currentPort: 'SAP', // 札幌からスタート
    cargo: [],
  },
  {
    id: 'small',
    type: 'small',
    name: '小型船',
    capacity: 12, // 積載量12
    speed: 3, // 1ターンに3エッジ移動（最も速い）
    maxColors: 1, // 1色のみ
    status: 'docked',
    currentPort: 'MYZ', // 宮崎からスタート
    cargo: [],
  },
];

// 都市在庫の初期値（全て20）
export const INITIAL_CITY_INVENTORIES: CityInventory[] = [
  { portId: 'TKO', color: 'red', stock: 20 },
  { portId: 'SAP', color: 'blue', stock: 20 },
  { portId: 'MYZ', color: 'yellow', stock: 20 },
  { portId: 'ISK', color: 'green', stock: 20 },
];

// 需要テーブル（難易度調整版）
// 赤・青: 需要大（減少が大きい）、黄・緑: 需要小（減少が少ない）
// TKO=赤、SAP=青、MYZ=黄、ISK=緑
export const DEMAND_TABLES: DemandTable[] = [
  {
    level: 1,
    turnRange: [1, 10],
    // 赤青: 2、黄緑: 1
    demand: { TKO: 2, SAP: 2, MYZ: 1, ISK: 1, OKN: 0, RUS: 0, KOR: 0, TAW: 0, PHL: 0, CHN: 0, GUM: 0, PLW: 0, PNG: 0, OGS: 0, VNM: 0, IDN: 0, MTR: 0, SGP: 0, SKH: 0, KMC: 0, AUS: 0, IND: 0 },
  },
  {
    level: 2,
    turnRange: [11, 20],
    // 赤青: 3、黄緑: 2
    demand: { TKO: 3, SAP: 3, MYZ: 2, ISK: 2, OKN: 0, RUS: 0, KOR: 0, TAW: 0, PHL: 0, CHN: 0, GUM: 0, PLW: 0, PNG: 0, OGS: 0, VNM: 0, IDN: 0, MTR: 0, SGP: 0, SKH: 0, KMC: 0, AUS: 0, IND: 0 },
  },
  {
    level: 3,
    turnRange: [21, 30],
    // 赤青: 4、黄緑: 3
    demand: { TKO: 4, SAP: 4, MYZ: 3, ISK: 3, OKN: 0, RUS: 0, KOR: 0, TAW: 0, PHL: 0, CHN: 0, GUM: 0, PLW: 0, PNG: 0, OGS: 0, VNM: 0, IDN: 0, MTR: 0, SGP: 0, SKH: 0, KMC: 0, AUS: 0, IND: 0 },
  },
];

// ゲーム設定
export const GAME_CONFIG = {
  maxTurns: 30,
  demandLevelUpTurns: [11, 21], // 需要レベルが上がるターン
};

// 船の速度から所要ターン数を計算
export function calculateTravelTime(distance: number, shipSpeed: number): number {
  return Math.ceil(distance / shipSpeed);
}

// 指定したターンの需要レベルを取得
export function getDemandLevel(turn: number): 1 | 2 | 3 {
  if (turn <= 10) return 1;
  if (turn <= 20) return 2;
  return 3;
}

// 指定したターンの需要量を取得
export function getDemandForTurn(turn: number, portId: PortId): number {
  const level = getDemandLevel(turn);
  const table = DEMAND_TABLES.find((t) => t.level === level);
  return table?.demand[portId] ?? 0;
}

// 指定した需要レベルでの消費量を取得
export function getDemandForPort(portId: PortId, level: number): number {
  const table = DEMAND_TABLES.find((t) => t.level === level);
  return table?.demand[portId] ?? 0;
}
