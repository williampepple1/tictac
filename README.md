# Online Tic Tac Toe Game

A real-time multiplayer Tic Tac Toe game built with Vite, React, TypeScript, Firebase, and WebRTC.

## Features

- Real-time multiplayer gameplay using WebRTC
- Game session management with Firebase
- Automatic game cleanup after 3 days
- Immutable moves once placed
- Modern and responsive UI

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project and enable Firestore
4. Update the Firebase configuration in `src/config/firebase.ts` with your project credentials

5. Start the development server:
   ```bash
   npm run dev
   ```

## How to Play

1. Click "Create New Game" to start a new game session
2. Share the game ID with your opponent
3. The opponent can join using the game ID
4. Players take turns placing X and O on the board
5. The first player to get three in a row wins
6. Games are automatically deleted after 3 days

## Technologies Used

- Vite
- React
- TypeScript
- Firebase (Firestore)
- WebRTC (simple-peer)
- CSS Grid for layout
