import SimplePeer from 'simple-peer';
import { GameMove } from '../types/game';

export class WebRTCService {
  private peer: SimplePeer.Instance | null = null;
  private onMoveCallback: ((move: GameMove) => void) | null = null;

  constructor() {
    this.peer = null;
  }

  initializePeer(isInitiator: boolean, stream?: MediaStream) {
    this.peer = new SimplePeer({
      initiator: isInitiator,
      trickle: false,
      stream
    });

    this.peer.on('signal', (data) => {
      // This will be handled by the game component
      console.log('Signal data:', data);
    });

    this.peer.on('data', (data) => {
      const move: GameMove = JSON.parse(data.toString());
      if (this.onMoveCallback) {
        this.onMoveCallback(move);
      }
    });

    return this.peer;
  }

  sendMove(move: GameMove) {
    if (this.peer) {
      this.peer.send(JSON.stringify(move));
    }
  }

  setOnMoveCallback(callback: (move: GameMove) => void) {
    this.onMoveCallback = callback;
  }

  destroy() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
} 