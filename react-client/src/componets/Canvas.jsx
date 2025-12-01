// src/componets/Canvas.jsx
import { useEffect, useRef } from "react";
import { socket } from "../socket";

// tweak these if you want the painting bigger/smaller
const CANVAS_WIDTH = 350;
const CANVAS_HEIGHT = 500;

export default function Canvas({ brushColor, brushSize, onPaint, isOnCooldown }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // ---- helper: draw one paint splat ----
  const drawSplat = (x, y, color, size) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    // medium main blob in the center
    const mainRadius = size * 0.35; // 0.35 was small, 0.45 = medium

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, mainRadius, 0, Math.PI * 2);
    ctx.fill();

    // splatter dots around the main blob
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * size * 1.3; // how far drops fly
      const dropSize = (Math.random() * size) / 5;

      const dx = x + Math.cos(angle) * distance;
      const dy = y + Math.sin(angle) * distance;

      ctx.beginPath();
      ctx.arc(dx, dy, dropSize, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // ---- setup canvas + Mona Lisa ----
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    // background image
    const img = new Image();
    img.src = "./mona-lisa.png"; // make sure this exists in /public
    img.onload = () => {
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };
  }, []);

  // ---- handle incoming splats from other users ----
  useEffect(() => {
    const handleDraw = ({ x, y, color, size }) => {
      drawSplat(x, y, color, size);
    };

    socket.on("draw", handleDraw);
    return () => socket.off("draw", handleDraw);
  }, []);

  // ---- click handler: single splat, respect cooldown ----
  const handleClick = (e) => {
    if (isOnCooldown) {
      // ignore clicks during cooldown
      return;
    }

    const { offsetX, offsetY } = e.nativeEvent;

    // local splat
    drawSplat(offsetX, offsetY, brushColor, brushSize);

    // send to others
    socket.emit("draw", {
      x: offsetX,
      y: offsetY,
      color: brushColor,
      size: brushSize,
    });

    // start cooldown in parent
    if (onPaint) {
      onPaint();
    }
  };

  return (
    <canvas
      className="canvas-painting"
      ref={canvasRef}
      onClick={handleClick}
      style={{
        // border: "14px solid #c9a464", 
        // borderRadius: "10px",
        // boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
        cursor: isOnCooldown ? "not-allowed" : "crosshair",
        backgroundColor: "transparent",
      }}
    />
  );
}
