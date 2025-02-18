import { useState, useEffect } from "react";
import * as speechCommands from "@tensorflow-models/speech-commands";
import * as tf from "@tensorflow/tfjs"; 
import "@tensorflow/tfjs-backend-webgl"; // Load WebGL backend
import "@tensorflow/tfjs-backend-wasm";  // Load WASM backend

const CONFIDENCE_THRESHOLD = 0.85; // Ignore words below 85% confidence

const useMicrophone = () => {
  const [recognizer, setRecognizer] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [detectedWord, setDetectedWord] = useState("");

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend("webgl"); // Set the backend to WebGL for performance
      await tf.ready(); // Ensure TensorFlow is fully initialized
      const model = await speechCommands.create("BROWSER_FFT");
      await model.ensureModelLoaded();
      setRecognizer(model);
    };

    loadModel();
  }, []);

  const handlePrediction = (predictions) => {
  const bestMatch = predictions.reduce((best, current) =>
    current.probability > best.probability ? current : best
  );

  if (bestMatch.probability >= CONFIDENCE_THRESHOLD) {
    setDetectedWord(bestMatch.word);
  } else {
    setDetectedWord(""); // Ignore low-confidence words
  }
};

  const startListening = () => {
    if (!recognizer) return;

    recognizer.listen(
      (result) => {
        const scores = result.scores;
        const labels = recognizer.wordLabels();
        const highestIndex = scores.indexOf(Math.max(...scores));
        handlePrediction(
        labels.map((label, index) => ({ word: label, probability: scores[index] }))
);

        console.log("Detected sound:", labels[highestIndex]); // Debugging output
      },
      { probabilityThreshold: 0.75 }
    );

    setIsListening(true);
  };

  const stopListening = () => {
    if (recognizer) recognizer.stopListening();
    setIsListening(false);
  };

  return { isListening, startListening, stopListening, detectedWord };
};

export default useMicrophone;
