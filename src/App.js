import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './styles/scanner.css';
import './styles/info.css';
import Scanner from './components/Scanner';
import Info from './components/Info';
function App() {
  const [capturedImage, setCapturedImage] = useState(null); // Initialize state for captured image
  const [budget, setBudget] = useState("Medium")
  const [health, setHealth] = useState("Medium")
  const [store, setStore] = useState("Safeway")
  const handleImageCapture = (imageDataURL) => {
    setCapturedImage(imageDataURL); // Set the captured image URL in state
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
              path="/scanner"
              element={
                <Scanner setHealth={setHealth} setBudget={setBudget} health={health} budget={budget} setStore={setStore} store={store} onImageCapture={handleImageCapture}/>
            }
          />
          <Route
              path="/info"
              element={
                <Info health={health} budget={budget} image={capturedImage} store={store}/>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;