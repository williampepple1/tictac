import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { WebRTCService } from '../services/webrtc';
import { BoardState, GameSession, GameMove, Player } from '../types/game';

const TicTacToe = () => {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isHost, setIsHost] = useState(false);
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
      await updateDoc(doc(db, 'games', gameSession.id), {
        board: newBoard,
        status: 'finished',
        winner,
        lastMoveAt: Timestamp.now()
      });
    } else {
      await updateDoc(doc(db, 'games', gameSession.id), {
        board: newBoard,
        currentPlayer: currentPlayer === 'X' ? 'O' : 'X',
        lastMoveAt: Timestamp.now()
      });
    }
  };

  const createGame = async () => {
    const newGame: Omit<GameSession, 'id'> = {
      hostId: 'user1', // Replace with actual user ID
      board: Array(9).fill(null),
      currentPlayer: 'X',
      status: 'waiting',
      winner: null,
      createdAt: new Date(),
      lastMoveAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'games'), newGame);
    setGameSession({ ...newGame, id: docRef.id });
    setIsHost(true);
  };

  useEffect(() => {
    if (gameSession) {
      const q = query(collection(db, 'games'), where('id', '==', gameSession.id));
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
    }
  }, [gameSession]);

  return (
    <div className="game">
      <div className="status">
        {gameSession?.status === 'waiting' && 'Waiting for opponent...'}
        {gameSession?.status === 'playing' && `Current player: ${currentPlayer}`}
        {gameSession?.status === 'finished' && `Winner: ${gameSession.winner}`}
      </div>
      <div className="board">
        {board.map((cell, index) => (
          <button
            key={index}
            className="cell"
            onClick={() => handleCellClick(index)}
            disabled={cell !== null || gameSession?.status !== 'playing'}
          >
            {cell}
          </button>
        ))}
      </div>
      {!gameSession && (
        <button onClick={createGame}>Create New Game</button>
      )}
    </div>
  );
};

export default TicTacToe; 