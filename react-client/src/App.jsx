import { useState, useEffect } from "react";
import "./App.css";
import Canvas from "./componets/Canvas.jsx";

export default function App() {
  const [brushColor, setBrushColor] = useState("#ff0000");
  const [brushSize] = useState(40);

  const COOLDOWN_MS = 2000; // 2 seconds
  const [cooldownMs, setCooldownMs] = useState(0);

  const isOnCooldown = cooldownMs > 0;
  const remainingPercent = isOnCooldown
    ? (cooldownMs / COOLDOWN_MS) * 100
    : 0;

  // called every time a paint splat happens
  const handlePaint = () => {
    setCooldownMs(COOLDOWN_MS);
  };

  // countdown ticking
  useEffect(() => {
    if (cooldownMs <= 0) return;

    const id = setInterval(() => {
      setCooldownMs((prev) => {
        const next = prev - 100;
        return next <= 0 ? 0 : next;
      });
    }, 100);

    return () => clearInterval(id);
  }, [cooldownMs]);

  const fruitColors = [
    { name: "Tomato", color: "#ff3b30", image: "./fruit/tomato.png" },
    { name: "Orange", color: "#ffa500", image: "./fruit/orange.png" },
    { name: "Blueberry", color: "#003cff", image: "./fruit/blueberry.png" },
    { name: "Grape", color: "#7b2cff", image: "./fruit/beet.png" },
  ];

  return (
    <div className="app-shell">
      <h1 className="title">Pick a fruit to throw at the Mona Lisa</h1>

      <Canvas
        brushColor={brushColor}
        brushSize={brushSize}
        onPaint={handlePaint}
        isOnCooldown={isOnCooldown}   // ✅ important line
      />

      <div className="controls">
        <div className="fruit-row">
          {fruitColors.map((fruit) => {
            const isSelected = brushColor === fruit.color;

            return (
              <button
                key={fruit.name}
                className={
                  `fruit-circle ${isSelected ? "selected" : ""} ${isOnCooldown ? "cooling" : ""}`
                }
                onClick={() => !isOnCooldown && setBrushColor(fruit.color)}
                aria-label={fruit.name}
                disabled={isOnCooldown}
              >
                <img
                  src={fruit.image}
                  alt={fruit.name}
                  className="fruit-image"
                />
                <div
                  className="fruit-cooldown-mask"
                  style={{ height: `${remainingPercent}%` }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
