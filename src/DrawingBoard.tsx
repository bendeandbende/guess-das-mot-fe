import React, { useRef, useEffect } from "react";
import CanvasDraw from "react-canvas-draw";
import { Socket } from "socket.io-client";

interface DrawingBoardProps {
  gameId: string;
  socket: typeof Socket;
}

const DrawingBoard: React.FC<DrawingBoardProps> = ({ gameId, socket }) => {
  const canvasRef = useRef<CanvasDraw>(null);

  useEffect(() => {
    socket.on("drawingData", (payload: { gameId: string; data: string }) => {
      if (canvasRef.current && payload.gameId === gameId) {
        canvasRef.current.loadSaveData(payload.data, true);
      }
    });

    return () => {
      socket.off("drawingData");
    };
  }, [socket, gameId]);

  const handleSave = () => {
    const saveData = canvasRef.current?.getSaveData();
    if (saveData) {
      socket.emit("drawingData", { gameId, data: saveData });
    }
  };

  return (
    <div>
      <CanvasDraw ref={canvasRef} />
      <button onClick={handleSave}>Send Drawing</button>
    </div>
  );
};

export default DrawingBoard;
