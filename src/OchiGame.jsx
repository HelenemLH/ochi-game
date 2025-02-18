import React, { useEffect, useState } from "react";
import useMicrophone from "./hooks/useMicrophone";
import { motion } from "framer-motion";
import "./App.css";

const OchiGame = () => {
  const { isListening, startListening, stopListening, detectedWord } = useMicrophone();
  const [ochiPosition, setOchiPosition] = useState({ x: 0, y: 200, rotate: 0, velocity: 0 });
  const [jumpCount, setJumpCount] = useState(0);
  const [background, setBackground] = useState("bg-transfagarasan"); 
  const gravity = 5;
  const groundY = 315;
  const ochiHeight = 50; 
  const ochiWidth = 50;

  const platforms = [
  { x: 150, y: 250, width: 100, height: 10 }, 
  { x: 350, y: 200, width: 120, height: 10 }, 
  { x: 550, y: 150, width: 100, height: 10 }, 

  { x: 100, y: 180, width: 80, height: 10 }, 
  { x: 300, y: 100, width: 150, height: 10 }, 
  { x: 500, y: 220, width: 120, height: 10 }, 
  { x: 700, y: 170, width: 100, height: 10 } 
];


  useEffect(() => {
    console.log("Detected Word:", detectedWord);

    setOchiPosition((prev) => {
      switch (detectedWord) {
        case "right":
        case "go":
          return { ...prev, x: prev.x + 50 };
        case "left":
          return { ...prev, x: prev.x - 50 };
        case "up":
          if (jumpCount < 2) {
            setJumpCount(jumpCount + 1);
            return { ...prev, velocity: -30 };
          }
          return prev;
        case "down":
          return { ...prev, y: prev.y + 50 };
        case "spin":
        case "rotate":
          return { ...prev, rotate: prev.rotate + 360 };
        default:
          return prev;
      }
    });
  }, [detectedWord]);

  useEffect(() => {
  const interval = setInterval(() => {
    setOchiPosition((prev) => {
      let newY = prev.y + prev.velocity;
      let newVelocity = prev.velocity + gravity;
      let landed = false;

      // If Ochi lands on a platform
for (let platform of platforms) {
  if (
    prev.x + ochiWidth >= platform.x &&  // Ochi's right side is past platform's left side
    prev.x <= platform.x + platform.width && // Ochi's left side is before platform's right side
    prev.y + ochiHeight <= platform.y && // Ochi is above platform
    newY + ochiHeight >= platform.y // Ochi is about to land
  ) {
    landed = true;
    newY = platform.y - ochiHeight; // Align Ochi perfectly on the platform
    newVelocity = 0; // Stop downward movement
    setJumpCount(0); // Reset jump count when landing
    break;
  }
}


      // If no platform was landed on, check ground collision
      if (!landed && newY + ochiHeight >= groundY) {
        newY = groundY - ochiHeight;
        newVelocity = gravity;
        setJumpCount(0);
      }

      return { ...prev, y: newY, velocity: newVelocity };
    });
  }, 50);

  return () => clearInterval(interval);
}, [platforms]);


  // 🌄 **Change Background Based on Ochi's X Position**
  useEffect(() => {
    if (ochiPosition.x < 300) {
      setBackground("bg-transfagarasan");
    } else if (ochiPosition.x < 600) {
      setBackground("bg-balea");
    } else {
      setBackground("bg-apuseni");
    }
  }, [ochiPosition.x]);

  return (
    <div className={`game-container ${background}`}>
      <h1>Ochi Game</h1>
      <button onClick={startListening} disabled={isListening}>Start Listening</button>
      <button onClick={stopListening} disabled={!isListening}>Stop Listening</button>

      <div className="game-area">
<motion.img
  src="/ochi.png"
  alt="Ochi"
  className="ochi"
  animate={{
    x: ochiPosition.x,
    y: ochiPosition.y,
    rotate: ochiPosition.rotate,
  }}
  transition={{ type: "spring", stiffness: 200, damping: 20 }}
 
/>

        
        {/* Ground */}
        <div className="ground"></div>

        {/* Floating Platforms */}
        {platforms.map((platform, index) => (
          <div
            key={index}
            className="platform"
            style={{ left: `${platform.x}px`, top: `${platform.y}px`, width: `${platform.width}px`, height: `${platform.height}px` }}
          />
        ))}
      </div>

      <div className="sound-indicator">
        {isListening ? `Listening... (Detected: ${detectedWord})` : "Click Start"}
      </div>
    </div>
  );
};

export default OchiGame;
