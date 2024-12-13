import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import DrawingBoard from "./DrawingBoard";

const socket = io(import.meta.env.VITE_API_URL);

interface Player {
  id: string;
  name: string;
}

interface Game {
  id: string;
  players: Player[];
  drawer: Player;
  word: string;
}

interface DrawingStartedData {
  word: string;
}

const App: React.FC = () => {
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isDrawer, setIsDrawer] = useState(false);
  const [word, setWord] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("gameUpdate", (game: Game) => {
      console.log("Game update:", game);
      setIsDrawer(game.drawer.id === socket.id);
    });

    socket.on("drawingStarted", (data: DrawingStartedData) => {
      setWord(data.word);
    });

    return () => {
      socket.off("connect");
      socket.off("gameUpdate");
      socket.off("drawingStarted");
    };
  }, []);

  const joinGame = () => {
    socket.emit("joinGame", { gameId, playerName });
    setIsConnected(true);
  };

  const startDrawing = () => {
    socket.emit("startDrawing", { gameId, word });
  };

  return (
    <div>
      {!isConnected ? (
        <div>
          <input
            type="text"
            placeholder="Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Player Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={joinGame}>Join Game</button>
        </div>
      ) : (
        <div>
          {isDrawer && (
            <div>
              <input
                type="text"
                placeholder="Word to draw"
                value={word}
                onChange={(e) => setWord(e.target.value)}
              />
              <button onClick={startDrawing}>Start Drawing</button>
            </div>
          )}
          <DrawingBoard gameId={gameId} socket={socket} />
        </div>
      )}
    </div>
  );
};

export default App;
