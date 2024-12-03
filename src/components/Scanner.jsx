import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
function Scanner({ setHealth, setBudget, health, budget, setStore, store, onImageCapture }) { // Accept the onImageCapture prop from the parent
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    }

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        let stream = videoRef.current.srcObject;
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
  
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      // Convert the canvas image to Base64
      const imageDataUrl = canvas.toDataURL('image/png');
      onImageCapture(imageDataUrl, false, health, budget); // Optional: Pass the image to the parent if needed
  

      try {
        // Send the image to the backend
        const response = await fetch('https://smartshoppernov22.onrender.com/api/save-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageDataUrl }),
        });
  
        if (response.ok) {
          console.log('Image saved successfully!');
        } else {
          console.error(`Failed to save the image.${response.statusText}`);
        }
      } catch (error) {
        console.error('Error saving image:', error);
      }
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center gradient-bg" style={{ height: "100vh", margin: "0", width: "100%" }}>
      <h1 className="text-center text-white bg-transparent">Scan Item</h1>
      <div className="buttons btn-group d-flex" style={{ width: "100%" }}>
        <div className="btn-group" style={{ flex: 1 }}>
          <button type="button" className="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Budget: <br />{budget}</button>
          <div className="dropdown-menu">
            <a className="dropdown-item" href="#" onClick={() => setBudget("Low")}>Low</a>
            <a className="dropdown-item" href="#" onClick={() => setBudget("Medium")}>Medium</a>
            <a className="dropdown-item" href="#" onClick={() => setBudget("High")}>High</a>
            <a className="dropdown-item" href="#" onClick={() => setBudget("Super High")}>Super High</a>
          </div>
        </div>
        <div className="btn-group" style={{ flex: 1 }}>
          <button type="button" className="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Store: <br />{store}</button>
          <div className="dropdown-menu">
            <a className="dropdown-item" href="#" onClick={() => setStore("Safeway")}>Safeway</a>
            <a className="dropdown-item" href="#" onClick={() => setStore("Trader Joe's")}>Trader Joe's</a>
            <a className="dropdown-item" href="#" onClick={() => setStore("Costco")}>Costco</a>
            <a className="dropdown-item" href="#" onClick={() => setStore("Walmart")}>Walmart</a>
            <a className="dropdown-item" href="#" onClick={() => setStore("Whole Foods")}>Whole Foods</a>
          </div>
        </div>
        <div className="btn-group" style={{ flex: 1 }}>
          <button type="button" className="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Health Importance:<br />{health}</button>
          <div className="dropdown-menu">
            <a className="dropdown-item" href="#" onClick={() => setHealth("Low")}>Low</a>
            <a className="dropdown-item" href="#" onClick={() => setHealth("Medium")}>Medium</a>
            <a className="dropdown-item" href="#" onClick={() => setHealth("High")}>High</a>
            <a className="dropdown-item" href="#" onClick={() => setHealth("Super High")}>Super High</a>
          </div>
        </div>
      </div>
      <video className="video" ref={videoRef} autoPlay playsInline />
      <button onClick={() => { handleCapture(); navigate("/info"); }} className="btn btn-primary capture align-self-center text-white">C</button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default Scanner;