import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import DrawingBoard from "./DrawingBoard";

const socket = io(import.meta.env.VITE_API_URL);

interface Player {
  id: string;
  name: string;
}

export interface Game {
  id: string;
  players: Player[];
  drawer: Player | null;
  word: string;
  status: "INACTIVE" | "ACTIVE" | "PREPARING" | "DRAWING" | "FINISHED";
  round: number;
  drawingQueue: Player[];
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
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("gameUpdate", (updatedGame: Game) => {
      setGame(updatedGame);
      setIsDrawer(updatedGame.drawer?.id === socket.id);
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

  const startGame = () => {
    socket.emit("startGame", { gameId });
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
          {game?.status === "INACTIVE" && (
            <button onClick={startGame}>Start Game</button>
          )}
          {isDrawer && game?.status === "PREPARING" && (
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
          <div>
            <p>Round: {game?.round}</p>
            <p>Current Drawer: {game?.drawer?.name}</p>
            <p>Status: {game?.status}</p>
          </div>
          <DrawingBoard
            gameId={gameId}
            socket={socket}
            isCurrentDrawer={isDrawer}
            gameStatus={game?.status || ""}
          />
        </div>
      )}
    </div>
  );
};

export default App;
