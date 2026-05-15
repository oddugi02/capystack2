export type MatterKind =
  | 'circle'
  | 'rect'
  | 'trapezoid'
  | 'compound-bird'
  | 'compound-ramen'
  | 'compound-towel'
  | 'polygon-stone';

export interface StackItemDef {
  id: string;
  name: string;
  matterKind: MatterKind;
  width: number;
  height: number;
  color: string;
  stroke: string;
  density?: number;
  friction?: number;
  restitution?: number;
  rare?: boolean;
}

export interface GameScore {
  floors: number;
  heightCm: number;
}

export type GamePhase = 'intro' | 'aiming' | 'falling' | 'ended';

export interface Records {
  allTime: number;
  daily: number;
}
