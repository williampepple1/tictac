import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { WebRTCService } from '../services/webrtc';
import type { BoardState, GameSession, GameMove, Player } from '../types/game';

interface TicTacToeProps {
  gameId: string;
  onGameEnd: () => void;
}

const TicTacToe = ({ gameId, onGameEnd }: TicTacToeProps) => {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [webrtc] = useState(() => new WebRTCService());

  const checkWinner = (board: BoardState): Player | 'draw' | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return board.every(cell => cell !== null) ? 'draw' : null;
  };

  const handleCellClick = async (index: number) => {
    if (!gameSession || board[index] !== null || gameSession.status !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const move: GameMove = {
      position: index,
      player: currentPlayer,
      timestamp: new Date()
    };

    webrtc.sendMove(move);

    const winner = checkWinner(newBoard);
    if (winner) {
      await updateDoc(doc(db, 'games', gameId), {
        board: newBoard,
        status: 'finished',
        winner,
        lastMoveAt: Timestamp.now()
      });
      onGameEnd();
    } else {
      await updateDoc(doc(db, 'games', gameId), {
        board: newBoard,
        currentPlayer: currentPlayer === 'X' ? 'O' : 'X',
        lastMoveAt: Timestamp.now()
      });
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'games'), where('id', '==', gameId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const updatedGame = change.doc.data() as GameSession;
          setGameSession(updatedGame);
          setBoard(updatedGame.board);
          setCurrentPlayer(updatedGame.currentPlayer);
        }
      });
    });

    return () => unsubscribe();
  }, [gameId]);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-2xl font-bold text-gray-700">
        {gameSession?.status === 'waiting' && 'Waiting for opponent...'}
        {gameSession?.status === 'playing' && `Current player: ${currentPlayer}`}
        {gameSession?.status === 'finished' && `Winner: ${gameSession.winner}`}
      </div>
      <div className="grid grid-cols-3 gap-2 bg-gray-800 p-2 rounded-lg">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`
              w-20 h-20 text-4xl font-bold rounded
              ${cell === null ? 'bg-white hover:bg-gray-100' : 'bg-white'}
              ${gameSession?.status !== 'playing' ? 'cursor-not-allowed' : 'cursor-pointer'}
              transition-colors duration-200
            `}
            onClick={() => handleCellClick(index)}
            disabled={cell !== null || gameSession?.status !== 'playing'}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TicTacToe; 