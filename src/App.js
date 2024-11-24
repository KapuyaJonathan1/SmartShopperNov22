import React, { useState } from 'react';
import './styles/scanner.css';
import './styles/info.css';
import Scanner from './components/Scanner';
import Info from './components/Info';
import CaptureButton from './components/CaptureButton';

function App() {
  const [capturedImage, setCapturedImage] = useState(null); // Initialize state for captured image
  const [scanning, setScanning] = useState(true);
  const [budget, setBudget] = useState("Medium")
  const [health, setHealth] = useState("Medium")
  const [store, setStore] = useState("Safeway")
  const switchPage = () => {

    setScanning(!scanning);

  };

  const handleImageCapture = (imageDataURL, scanning, health, budget) => {
    setCapturedImage(imageDataURL); // Set the captured image URL in state
    setScanning(scanning);
  };

  return (
    <div className="App">
      <div style={{display: scanning ? 'flex' : 'none'}}>
        <Scanner setHealth={setHealth} setBudget={setBudget} health={health} budget={budget} setStore={setStore} store={store} onImageCapture={handleImageCapture} switchPage={switchPage} />
      </div>

      <div style={{display: scanning ? 'none' : 'flex'}}>
        <Info health={health} budget={budget} image={capturedImage} store={store} switchPage={switchPage} />
      </div>
    </div>
  );
}

export default App;