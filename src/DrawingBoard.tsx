import React, { useRef, useEffect } from "react";
import CanvasDraw from "react-canvas-draw";
import { Socket } from "socket.io-client";

interface DrawingBoardProps {
  gameId: string;
  socket: typeof Socket;
  isCurrentDrawer: boolean;
  gameStatus: string;
}

const DrawingBoard: React.FC<DrawingBoardProps> = ({
  gameId,
  socket,
  isCurrentDrawer,
  gameStatus,
}) => {
  const canvasRef = useRef<CanvasDraw>(null);

  useEffect(() => {
    if (gameStatus === "PREPARING" && canvasRef.current) {
      canvasRef.current.clear();
    }
  }, [gameStatus]);

  useEffect(() => {
    const handleDrawingData = (payload: { gameId: string; data: string }) => {
      if (canvasRef.current && payload.gameId === gameId && !isCurrentDrawer) {
        canvasRef.current.loadSaveData(payload.data, true);
      }
    };

    socket.on("drawingData", handleDrawingData);

    return () => {
      socket.off("drawingData", handleDrawingData);
    };
  }, [socket, gameId, isCurrentDrawer]);

  const handleChange = () => {
    if (isCurrentDrawer) {
      const saveData = canvasRef.current?.getSaveData();
      if (saveData) {
        socket.emit("drawingData", { gameId, data: saveData });
      }
    }
  };

  return (
    <div>
      <CanvasDraw
        ref={canvasRef}
        disabled={!isCurrentDrawer}
        hideInterface={!isCurrentDrawer}
        brushRadius={4}
        onChange={handleChange}
      />
    </div>
  );
};

export default DrawingBoard;
