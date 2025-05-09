export type Player = 'X' | 'O';
export type BoardState = (Player | null)[];
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameSession {
  id: string;
  hostId: string;
  guestId?: string;
  board: BoardState;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | 'draw' | null;
  createdAt: Date;
  lastMoveAt: Date;
}

export interface GameMove {
  position: number;
  player: Player;
  timestamp: Date;
} 