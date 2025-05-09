import SimplePeer from 'simple-peer';
import type { GameMove } from '../types/game';

export class WebRTCService {
  private peer: SimplePeer.Instance | null = null;
  private onMoveCallback: ((move: GameMove) => void) | null = null;

  constructor() {
    this.peer = null;
  }

  initializePeer(isInitiator: boolean, stream?: MediaStream) {
    const iceServers = [
      {
        urls: import.meta.env.VITE_WEBRTC_ICE_SERVER_URL,
        username: import.meta.env.VITE_WEBRTC_ICE_SERVER_USERNAME,
        credential: import.meta.env.VITE_WEBRTC_ICE_SERVER_CREDENTIAL
      },
      // Fallback to Google's STUN server
      {
        urls: 'stun:stun.l.google.com:19302'
      }
    ];

    this.peer = new SimplePeer({
      initiator: isInitiator,
      trickle: false,
      stream,
      config: {
        iceServers,
        iceCandidatePoolSize: 10
      }
    });

    this.peer.on('signal', (data) => {
      console.log('Signal data:', data);
    });

    this.peer.on('connect', () => {
      console.log('WebRTC connection established');
    });

    this.peer.on('error', (err) => {
      console.error('WebRTC error:', err);
    });

    this.peer.on('data', (data) => {
      try {
        const move: GameMove = JSON.parse(data.toString());
        if (this.onMoveCallback) {
          this.onMoveCallback(move);
        }
      } catch (error) {
        console.error('Error parsing move data:', error);
      }
    });

    return this.peer;
  }

  sendMove(move: GameMove) {
    if (this.peer && this.peer.connected) {
      this.peer.send(JSON.stringify(move));
    } else {
      console.warn('Cannot send move: WebRTC peer not connected');
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