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
  KYT: {
    id: 'KYT',
    name: 'Kyoto',
    nameJp: '京都',
    type: 'demand',
    position: { lat: 35.6681, lng: 135.1500 }, // 京都北部（舞鶴付近）
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
    position: { lat: 37.4563, lng: 126.7052 }, // 仁川
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
  HKG: {
    id: 'HKG',
    name: 'Hong Kong',
    nameJp: '香港',
    type: 'supply',
    position: { lat: 22.3193, lng: 114.1694 }, // 香港
    // 赤1黄1
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
    // 黄2赤1（カムチャッカ削除のため供給量を移行）
    cargoStock: { red: 1, blue: 0, yellow: 2, green: 0 },
    supplyPerTurn: { red: 0.5, blue: 0, yellow: 1, green: 0 },
  },
  // 南側新拠点
  AUS: {
    id: 'AUS',
    name: 'Australia',
    nameJp: 'オーストラリア',
    type: 'supply',
    position: { lat: -12.4634, lng: 130.8456 }, // ノーザンテリトリー州北部（ダーウィン）
    // 緑2青2
    cargoStock: { red: 0, blue: 2, yellow: 0, green: 2 },
    supplyPerTurn: { red: 0, blue: 1, yellow: 0, green: 1 },
  },
  // バングラデシュ
  BGD: {
    id: 'BGD',
    name: 'Bangladesh',
    nameJp: 'バングラデシュ',
    type: 'supply',
    position: { lat: 22.3569, lng: 91.7832 }, // チッタゴン港
    // 緑2青1
    cargoStock: { red: 0, blue: 1, yellow: 0, green: 2 },
    supplyPerTurn: { red: 0, blue: 0.5, yellow: 0, green: 1 },
  },
};

// 航路の設定（全て距離1 = 1エッジ）
export const ROUTES: Route[] = [
  // 日本への航路（西側）
  { from: 'RUS', to: 'SAP', distance: 1 },
  { from: 'RUS', to: 'KYT', distance: 1 },
  { from: 'KOR', to: 'SAP', distance: 1 },
  { from: 'KOR', to: 'MYZ', distance: 1 },
  { from: 'KOR', to: 'KYT', distance: 1 },
  { from: 'TAW', to: 'MYZ', distance: 1 },
  { from: 'TAW', to: 'OKN', distance: 1 },
  { from: 'PHL', to: 'OKN', distance: 1 },
  // 日本国内の航路
  { from: 'TKO', to: 'SAP', distance: 1 },
  { from: 'TKO', to: 'OKN', distance: 1 },
  { from: 'MYZ', to: 'TKO', distance: 1 },
  { from: 'MYZ', to: 'OKN', distance: 1 },
  { from: 'SAP', to: 'KYT', distance: 1 },
  // 日本への航路（太平洋側）
  { from: 'OGS', to: 'TKO', distance: 1 },
  // 供給拠点間の航路（西側）
  { from: 'RUS', to: 'KOR', distance: 1 },
  { from: 'KOR', to: 'TAW', distance: 1 },
  { from: 'HKG', to: 'TAW', distance: 1 },
  { from: 'HKG', to: 'VNM', distance: 1 },
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
  // オーストラリアの航路（パプアニューギニアとインドネシアに接続）
  { from: 'AUS', to: 'PNG', distance: 1 },
  { from: 'AUS', to: 'IDN', distance: 1 },
  // バングラデシュの航路（ベトナムとシンガポールに接続）
  { from: 'BGD', to: 'VNM', distance: 1 },
  { from: 'BGD', to: 'SGP', distance: 1 },
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
    maxColors: 2, // 2色積載可能
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
  { portId: 'KYT', color: 'green', stock: 20 },
];

// 需要テーブル（難易度調整版）
// 赤・青: 需要大（減少が大きい）、黄・緑: 需要小（減少が少ない）
// TKO=赤、SAP=青、MYZ=黄、KYT=緑
export const DEMAND_TABLES: DemandTable[] = [
  {
    level: 1,
    turnRange: [1, 10],
    // 赤青: 2、黄緑: 1
    demand: { TKO: 2, SAP: 2, MYZ: 1, KYT: 1, OKN: 0, RUS: 0, KOR: 0, TAW: 0, PHL: 0, HKG: 0, GUM: 0, PLW: 0, PNG: 0, OGS: 0, VNM: 0, IDN: 0, MTR: 0, SGP: 0, SKH: 0, AUS: 0, BGD: 0 },
  },
  {
    level: 2,
    turnRange: [11, 20],
    // 赤青: 3、黄緑: 2
    demand: { TKO: 3, SAP: 3, MYZ: 2, KYT: 2, OKN: 0, RUS: 0, KOR: 0, TAW: 0, PHL: 0, HKG: 0, GUM: 0, PLW: 0, PNG: 0, OGS: 0, VNM: 0, IDN: 0, MTR: 0, SGP: 0, SKH: 0, AUS: 0, BGD: 0 },
  },
  {
    level: 3,
    turnRange: [21, 30],
    // 赤青: 4、黄緑: 3
    demand: { TKO: 4, SAP: 4, MYZ: 3, KYT: 3, OKN: 0, RUS: 0, KOR: 0, TAW: 0, PHL: 0, HKG: 0, GUM: 0, PLW: 0, PNG: 0, OGS: 0, VNM: 0, IDN: 0, MTR: 0, SGP: 0, SKH: 0, AUS: 0, BGD: 0 },
  },
];

// ゲーム設定
export const GAME_CONFIG = {
  maxTurns: 30,
  demandLevelUpTurns: [11, 21], // 需要レベルが上がるターン
};

// 供給拠点の在庫上限（色ごと）
export const SUPPLY_STOCK_LIMITS: Record<PortId, number> = {
  // 需要拠点（上限なし）
  TKO: Infinity,
  SAP: Infinity,
  MYZ: Infinity,
  KYT: Infinity,
  // グループ1: 上限6
  RUS: 6,
  KOR: 6,
  OKN: 6,
  OGS: 6,
  TAW: 6,
  MTR: 6,
  // グループ2: 上限8
  SKH: 8,
  HKG: 8,
  PHL: 8,
  GUM: 8,
  // グループ3: 上限10
  BGD: 10,
  VNM: 10,
  SGP: 10,
  IDN: 10,
  AUS: 10,
  PNG: 10,
  PLW: 10,
};

// 船の速度から所要ターン数を計算
export function calculateTravelTime(distance: number, shipSpeed: number): number {
  return Math.ceil(distance / shipSpeed);
}

// エンドレスモードの需要レベル上限
const MAX_DEMAND_LEVEL = 5;

// 指定したターンの需要レベルを取得（エンドレスモード対応）
export function getDemandLevel(turn: number, isEndless: boolean = false): number {
  if (!isEndless) {
    // 通常モード: レベル1-3
    if (turn <= 10) return 1;
    if (turn <= 20) return 2;
    return 3;
  }
  // エンドレスモード: 10ターンごとにレベルアップ（上限5）
  const level = Math.floor((turn - 1) / 10) + 1;
  return Math.min(level, MAX_DEMAND_LEVEL);
}

// 指定したターンの需要量を取得（エンドレスモード対応）
export function getDemandForTurn(turn: number, portId: PortId, isEndless: boolean = false): number {
  const level = getDemandLevel(turn, isEndless);
  return getDemandForPort(portId, level);
}

// 指定した需要レベルでの消費量を取得（レベル4以上はレベルに応じて増加）
export function getDemandForPort(portId: PortId, level: number): number {
  // レベル3以下はテーブルから取得
  if (level <= 3) {
    const table = DEMAND_TABLES.find((t) => t.level === level);
    return table?.demand[portId] ?? 0;
  }
  // レベル4以上: レベル3をベースに、レベルが1上がるごとに+1ずつ増加
  const level3Table = DEMAND_TABLES.find((t) => t.level === 3);
  const baseDemand = level3Table?.demand[portId] ?? 0;
  const additionalDemand = level - 3;
  return baseDemand + additionalDemand;
}

// 供給拠点のIDリスト
const SUPPLY_PORT_IDS: PortId[] = ['OKN', 'RUS', 'KOR', 'TAW', 'VNM', 'PHL', 'HKG', 'GUM', 'PLW', 'IDN', 'PNG', 'OGS', 'MTR', 'SGP', 'SKH', 'AUS', 'BGD'];
const COLORS: ('red' | 'blue' | 'yellow' | 'green')[] = ['red', 'blue', 'yellow', 'green'];

// 港の色数をカウント（0より大きい色の数）
function countColors(supply: Record<string, number>): number {
  return COLORS.filter(c => supply[c] > 0).length;
}

// ランダム供給設定を生成する関数
// 制約: 港ごとの合計と色ごとの合計を維持したまま、0.5刻みでシャッフル
// 追加制約: 各港の色数は2種類以下
export function generateRandomSupplyPerTurn(): Record<PortId, Record<'red' | 'blue' | 'yellow' | 'green', number>> {
  // 現在の設定をコピー（supplyPerTurnを持つ港のみ）
  const result: Record<string, Record<string, number>> = {};
  const validPortIds: PortId[] = [];

  for (const portId of SUPPLY_PORT_IDS) {
    const port = INITIAL_PORTS[portId];
    if (port.supplyPerTurn) {
      result[portId] = { ...port.supplyPerTurn };
      validPortIds.push(portId);
    }
  }

  // ランダムモード用の初期調整
  // シンガポール: 緑0.5→黄0.5
  if (result['SGP']) {
    result['SGP'] = { red: 0, blue: 0, yellow: 0.5, green: 0 };
  }
  // パプアニューギニア: 緑0.5→黄0.5
  if (result['PNG']) {
    result['PNG'] = { red: 0, blue: 0, yellow: 0.5, green: 0 };
  }
  // 台湾: 赤0.5青0.5→赤1.0青0.0
  if (result['TAW']) {
    result['TAW'] = { red: 1, blue: 0, yellow: 0, green: 0 };
  }

  // スワップ対象がない場合は元の設定を返す
  if (validPortIds.length < 2) {
    return result as Record<PortId, Record<'red' | 'blue' | 'yellow' | 'green', number>>;
  }

  // ペアスワップを繰り返してシャッフル
  // 2つの港(p1, p2)と2つの色(c1, c2)を選び、
  // p1[c1] += delta, p1[c2] -= delta, p2[c1] -= delta, p2[c2] += delta
  // これにより行和・列和を維持したまま値を変更できる
  const maxAttempts = 20000;
  let successfulSwaps = 0;
  const targetSwaps = 5000;

  for (let i = 0; i < maxAttempts && successfulSwaps < targetSwaps; i++) {
    // ランダムに2つの港を選択（validPortIdsから）
    const p1Idx = Math.floor(Math.random() * validPortIds.length);
    let p2Idx = Math.floor(Math.random() * validPortIds.length);
    while (p2Idx === p1Idx) {
      p2Idx = Math.floor(Math.random() * validPortIds.length);
    }
    const p1 = validPortIds[p1Idx];
    const p2 = validPortIds[p2Idx];

    // ランダムに2つの色を選択
    const c1Idx = Math.floor(Math.random() * COLORS.length);
    let c2Idx = Math.floor(Math.random() * COLORS.length);
    while (c2Idx === c1Idx) {
      c2Idx = Math.floor(Math.random() * COLORS.length);
    }
    const c1 = COLORS[c1Idx];
    const c2 = COLORS[c2Idx];

    const delta = 0.5;

    const p1c1 = result[p1][c1];
    const p1c2 = result[p1][c2];
    const p2c1 = result[p2][c1];
    const p2c2 = result[p2][c2];

    // 正方向のスワップが可能か
    const canSwapPositive = p1c2 >= delta && p2c1 >= delta;
    // 負方向のスワップが可能か
    const canSwapNegative = p1c1 >= delta && p2c2 >= delta;

    // スワップ後の制約チェック用関数
    const checkConstraints = (direction: 'positive' | 'negative'): boolean => {
      // スワップ後の状態をシミュレート
      const newP1 = { ...result[p1] };
      const newP2 = { ...result[p2] };

      if (direction === 'positive') {
        newP1[c1] += delta;
        newP1[c2] -= delta;
        newP2[c1] -= delta;
        newP2[c2] += delta;
      } else {
        newP1[c1] -= delta;
        newP1[c2] += delta;
        newP2[c1] += delta;
        newP2[c2] -= delta;
      }

      // 制約1: 両方の港の色数が2以下かチェック
      const colorCountOk = countColors(newP1) <= 2 && countColors(newP2) <= 2;

      // 制約2: 各色の値が1.0以下かチェック
      const maxSupplyOk = COLORS.every(c => newP1[c] <= 1.0 && newP2[c] <= 1.0);

      return colorCountOk && maxSupplyOk;
    };

    // 制約を考慮してスワップ可否を判定
    const canPositiveWithLimit = canSwapPositive && checkConstraints('positive');
    const canNegativeWithLimit = canSwapNegative && checkConstraints('negative');

    if (canPositiveWithLimit && canNegativeWithLimit) {
      if (Math.random() < 0.5) {
        result[p1][c1] += delta;
        result[p1][c2] -= delta;
        result[p2][c1] -= delta;
        result[p2][c2] += delta;
      } else {
        result[p1][c1] -= delta;
        result[p1][c2] += delta;
        result[p2][c1] += delta;
        result[p2][c2] -= delta;
      }
      successfulSwaps++;
    } else if (canPositiveWithLimit) {
      result[p1][c1] += delta;
      result[p1][c2] -= delta;
      result[p2][c1] -= delta;
      result[p2][c2] += delta;
      successfulSwaps++;
    } else if (canNegativeWithLimit) {
      result[p1][c1] -= delta;
      result[p1][c2] += delta;
      result[p2][c1] += delta;
      result[p2][c2] -= delta;
      successfulSwaps++;
    }
    // どちらも不可能な場合はスキップ
  }

  console.log(`Random supply: ${successfulSwaps} swaps performed`);
  return result as Record<PortId, Record<'red' | 'blue' | 'yellow' | 'green', number>>;
}
