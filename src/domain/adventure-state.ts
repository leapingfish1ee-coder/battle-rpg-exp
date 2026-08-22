export type TownFacility = 'guild' | 'inn' | 'shop' | 'church' | 'gate';

export interface PartyMemberState {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly level: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly mp: number;
  readonly maxMp: number;
}

export interface TownFacilityState {
  readonly id: TownFacility;
  readonly label: string;
  readonly subtitle: string;
  readonly description: string;
}

export interface AdventureState {
  readonly screen: 'town';
  readonly townId: 'lumina';
  readonly townName: string;
  readonly townRegion: string;
  readonly day: number;
  readonly weather: 'clear';
  readonly gold: number;
  readonly objective: string;
  readonly selectedFacility: TownFacility;
  readonly facilities: readonly TownFacilityState[];
  readonly party: readonly PartyMemberState[];
}

export const TOWN_FACILITIES: readonly TownFacilityState[] = [
  {
    id: 'guild',
    label: '冒险者公会',
    subtitle: 'GUILD',
    description: '登记委托、确认冒险等级，并获取城外区域的最新情报。',
  },
  {
    id: 'inn',
    label: '银铃旅店',
    subtitle: 'INN',
    description: '休整队伍、整理旅途记录，并推进城镇中的时间。',
  },
  {
    id: 'shop',
    label: '白桦商会',
    subtitle: 'SHOP',
    description: '购买补给、装备与旅行用品，出售冒险途中获得的素材。',
  },
  {
    id: 'church',
    label: '晨曦礼拜堂',
    subtitle: 'CHAPEL',
    description: '接受祝福、恢复异常状态，并查阅王都的古老传承。',
  },
  {
    id: 'gate',
    label: '东城门',
    subtitle: 'DEPART',
    description: '离开王都，前往原野、古道与尚未探索的区域。',
  },
];

export const createInitialAdventureState = (): AdventureState => ({
  screen: 'town',
  townId: 'lumina',
  townName: '王都露米纳',
  townRegion: '阿斯特拉王国 · 中央领',
  day: 1,
  weather: 'clear',
  gold: 860,
  objective: '前往冒险者公会完成初次登记。',
  selectedFacility: 'guild',
  facilities: TOWN_FACILITIES,
  party: [
    {
      id: 'ain',
      name: '艾因',
      role: '见习剑士',
      level: 5,
      hp: 248,
      maxHp: 248,
      mp: 42,
      maxMp: 42,
    },
  ],
});

export const selectTownFacility = (
  state: AdventureState,
  facility: TownFacility,
): AdventureState => ({
  ...state,
  selectedFacility: facility,
});

export const moveTownSelection = (state: AdventureState, step: -1 | 1): AdventureState => {
  const currentIndex = state.facilities.findIndex((facility) => facility.id === state.selectedFacility);
  const nextIndex = (currentIndex + step + state.facilities.length) % state.facilities.length;
  return selectTownFacility(state, state.facilities[nextIndex]?.id ?? state.selectedFacility);
};
