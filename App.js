import React, { useState, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import "./App.css"; 

function App() {
  const [started, setStarted] = useState(false); 
  const [emotion, setEmotion] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);

  const capture = async () => {
    setEmotion("");
    setLoading(true);

    if (!webcamRef.current) {
      alert("Webcam not accessible.");
      setLoading(false);
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();

    try {
      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();
      formData.append("image", blob, "image.jpg");

      const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setEmotion(response.data.emotion);
    } catch (error) {
      console.error("Error:", error);
      setEmotion("Error detecting emotion.");
    }

    setLoading(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    setImage(URL.createObjectURL(file)); 

    setEmotion(""); 
    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setEmotion(response.data.emotion);
    } catch (error) {
      console.error("Error:", error);
      setEmotion("Error detecting emotion.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      {/* Intro Screen */}
      {!started ? (
        <div className="intro-screen">
          <h1>
            Let's start <span className="highlight">Sabyasachi Sarkar's</span>{" "}
            project
          </h1>
          <button className="start-btn" onClick={() => setStarted(true)}>
            Start
          </button>
        </div>
      ) : (
        <div className="main-app">
          <h1>Facial Emotion Detector</h1>

          <div className="webcam-container">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam"
            />
          </div>

          <button
            className="capture-btn"
            onClick={capture}
            disabled={loading}
          >
            {loading ? "Processing..." : "Capture & Detect Emotion"}
          </button>

          {/* Image Upload Section */}
          <div className="upload-section">
            <h3>Or upload an image</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="upload-input"
            />
            {image && (
              <div className="uploaded-image-container">
                <img src={image} alt="Uploaded" className="uploaded-image" />
              </div>
            )}
          </div>

          {emotion && (
            <div className="emotion-box">
              <p>
                Detected Emotion: <span className="emotion">{emotion}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
