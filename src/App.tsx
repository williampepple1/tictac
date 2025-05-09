import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import GameLobby from './components/GameLobby';
import TicTacToe from './components/TicTacToe';

const AppContent = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Tic Tac Toe Online
          </h1>
          <button
            onClick={signInWithGoogle}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg
              hover:bg-blue-700 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Tic Tac Toe Online
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Welcome, {user.displayName}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg
                hover:bg-red-700 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-red-500
                focus:ring-offset-2"
            >
              Sign Out
            </button>
          </div>
        </div>

        {currentGameId ? (
          <TicTacToe gameId={currentGameId} onGameEnd={() => setCurrentGameId(null)} />
        ) : (
          <GameLobby onGameStart={setCurrentGameId} />
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
