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
    { x: 150, y: 240, width: 100, height: 10 }, 
    { x: 350, y: 190, width: 120, height: 10 }, 
    { x: 550, y: 140, width: 100, height: 10 }, 
    { x: 100, y: 170, width: 80, height: 10 }, 
    { x: 300, y: 90, width: 150, height: 10 }, 
    { x: 500, y: 210, width: 120, height: 10 }, 
    { x: 700, y: 160, width: 100, height: 10 } 
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
          if (jumpCount < 2) { // Double jump support
            setJumpCount(jumpCount + 1);
            return { ...prev, velocity: -30 };
          }
          return prev;
        case "dash": 
          return { ...prev, x: prev.x + 100 };
        case "crouch": 
          return { ...prev, y: prev.y + 20 };
        case "six": 
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

        for (let platform of platforms) {
          if (
            prev.x + ochiWidth >= platform.x &&  
            prev.x <= platform.x + platform.width && 
            prev.y + ochiHeight <= platform.y && 
            newY + ochiHeight >= platform.y 
          ) {
            landed = true;
            newY = platform.y - ochiHeight;
            newVelocity = 0;
            setJumpCount(0);
            break;
          }
        }

        if (!landed && newY + ochiHeight >= groundY) {
          newY = groundY - ochiHeight;
          newVelocity = 0;
          setJumpCount(0);
        }

        return { ...prev, y: newY, velocity: newVelocity };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [platforms]);

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
        
        <div className="ground"></div>

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
