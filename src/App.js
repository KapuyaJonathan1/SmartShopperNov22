import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './styles/scanner.css';
import './styles/info.css';
import Scanner from './components/Scanner';
import Info from './components/Info';
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./AuthContext";
import Login from './components/Login';
function App() {
  const [capturedImage, setCapturedImage] = useState(null); // Initialize state for captured image
  const [budget, setBudget] = useState("Medium")
  const [health, setHealth] = useState("Medium")
  const [store, setStore] = useState("Safeway")
  const handleImageCapture = (imageDataURL) => {
    setCapturedImage(imageDataURL); // Set the captured image URL in state
  };

  return (
    <AuthProvider>
      <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
                path="/scanner"
                element={
                  <ProtectedRoute><Scanner setHealth={setHealth} setBudget={setBudget} health={health} budget={budget} setStore={setStore} store={store} onImageCapture={handleImageCapture}/></ProtectedRoute>
              }
            />
            <Route
                path="/info"
                element={ <ProtectedRoute><Info health={health} budget={budget} image={capturedImage} store={store}/></ProtectedRoute>
              }
            />
          </Routes>
      </Router>
    </AuthProvider>
  );

  
}

export default App;