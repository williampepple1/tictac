import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { GameSession } from '../types/game';

interface GameLobbyProps {
  onGameStart: (gameId: string) => void;
}

const GameLobby = ({ onGameStart }: GameLobbyProps) => {
  const { user } = useAuth();
  const [availableGames, setAvailableGames] = useState<GameSession[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'games'),
      where('status', '==', 'waiting')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const games: GameSession[] = [];
      snapshot.forEach((doc) => {
        games.push({ id: doc.id, ...doc.data() } as GameSession);
      });
      setAvailableGames(games);
    });

    return () => unsubscribe();
  }, []);

  const createGame = async () => {
    if (!user) return;

    const newGame: Omit<GameSession, 'id'> = {
      hostId: user.uid,
      hostName: user.displayName || 'Anonymous',
      board: Array(9).fill(null),
      currentPlayer: 'X',
      status: 'waiting',
      winner: null,
      createdAt: new Date(),
      lastMoveAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'games'), newGame);
    onGameStart(docRef.id);
  };

  const joinGame = async (gameId: string) => {
    if (!user) return;

    await updateDoc(doc(db, 'games', gameId), {
      guestId: user.uid,
      guestName: user.displayName || 'Anonymous',
      status: 'playing'
    });

    onGameStart(gameId);
  };

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-lg text-gray-700 mb-4">Please sign in to play</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Game Lobby</h2>
        <button
          onClick={createGame}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
            transition-colors duration-200 focus:outline-none focus:ring-2
            focus:ring-blue-500 focus:ring-offset-2"
        >
          Create New Game
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Available Games</h3>
        {availableGames.length === 0 ? (
          <p className="text-gray-600">No games available. Create one!</p>
        ) : (
          <div className="grid gap-4">
            {availableGames.map((game) => (
              <div
                key={game.id}
                className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    Host: {game.hostName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(game.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => joinGame(game.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg
                    hover:bg-green-700 transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-green-500
                    focus:ring-offset-2"
                >
                  Join Game
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby; 