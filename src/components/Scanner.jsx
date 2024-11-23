import React, { useRef, useEffect, useState } from 'react';

function Scanner({ setHealth, setBudget, health, budget, onImageCapture, switchPage }) { // Accept the onImageCapture prop from the parent
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  

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
        const response = await fetch('http://localhost:5000/api/save-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageDataUrl }),
        });
  
        if (response.ok) {
          console.log('Image saved successfully!');
        } else {
          console.error('Failed to save the image.');
        }
      } catch (error) {
        console.error('Error saving image:', error);
      }
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center gradient-bg" style={{height: "100vh", margin: "0"}}>
      <div className="d-flex" style={{width: "100vw"}}>
        <div class="btn-group" style={{width: "17vw"}}>
          <button type="button" class="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Budget: {budget}
          </button>
          <div class="dropdown-menu">
            <a class="dropdown-item" href="#" onClick={() => setBudget("Low")}>Low</a>
            <a class="dropdown-item" href="#" onClick={() => setBudget("Medium")}>Medium</a>
            <a class="dropdown-item" href="#" onClick={() => setBudget("High")}>High</a>
            <a class="dropdown-item" href="#" onClick={() => setBudget("Super High")}>Super High</a>
          </div>
        </div>
        <div class="btn-group" style={{width: "17vw"}}>
          <button type="button" class="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Health Importance: {health}
          </button>
          <div class="dropdown-menu">
            <a class="dropdown-item" href="#" onClick={() => setHealth("Low")}>Low</a>
            <a class="dropdown-item" href="#" onClick={() => setHealth("Medium")}>Medium</a>
            <a class="dropdown-item" href="#" onClick={() => setHealth("High")}>High</a>
            <div class="dropdown-divirde"></div>
            <a class="dropdown-item" href="#" onClick={() => setHealth("Super High")}>Super High</a>
          </div>
        </div>
      </div>
      <h1 className="text-center text-white">Scan Item</h1>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '607px', borderRadius: "10px" }} />
      <button onClick={handleCapture} className="btn btn-primary align-self-center text-white">C</button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default Scanner;