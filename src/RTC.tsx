// RTC.tsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';

interface RTCProps {
    handleVisionResult: (detectedObjects: any[]) => void;  // Function to pass detected objects to parent
  }


const RTC: React.FC<RTCProps> = ({ handleVisionResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);
  


  useEffect(() => {
    // Access the webcam
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam: ', err);
      }
    };

    getMedia();
  }, []);

  // Capture image from video stream
  const captureImage = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/png');  // Base64 image
      setCapturedImage(imageData);  // Store captured image in state
      return imageData;
      
    }
    return null;
  };



  // Send captured image to the backend for object detection
  const sendToVisionAPI = async () => {
    const image = captureImage();
    if (image) {
      try {
        const response = await axios.post('http://localhost:5001/api/detectObjects', {
          image,
        });
        const objects = response.data;  // Store detected objects
        setDetectedObjects(objects);
        handleVisionResult(objects);  // Pass detected objects to the parent component // Store detected objects
      } catch (error) {
        console.error('Error sending image to backend:', error);
      }
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
      <br />
      <Button onClick={sendToVisionAPI}>Capture and Analyze</Button>
      {capturedImage && <img src={capturedImage} alt="Captured" style={{ width: '100%' }} />}
      {detectedObjects.length > 0 && (
        <div>
          <h3>Detected Objects:</h3>
          <ul>
            {detectedObjects.map((obj, index) => {
              const centerX = obj.boundingPoly.normalizedVertices.reduce((acc: number, vertex: any) => acc + vertex.x, 0) / obj.boundingPoly.normalizedVertices.length;
              const centerY = obj.boundingPoly.normalizedVertices.reduce((acc: number, vertex: any) => acc + vertex.y, 0) / obj.boundingPoly.normalizedVertices.length;
              const directionX = centerX > 0.5 ? ' Left' : ' Right';
              const directionY = centerY > 0.5 ? ' Up' : ' Down';

              return (
              <li key={index}>
                <strong>{obj.name} - Confidence: {Math.round(obj.score * 100)}%</strong>
                <ul>
                <li>
                  Center:
                  x: {centerX},
                  y: {centerY}
                </li>
                <li>
                  {Math.abs(centerX - 0.5) < 0.1 && Math.abs(centerY - 0.5) < 0.1 ? 'Object is in the center' : 'Object is not in the center'}
                </li>
                {!(Math.abs(centerX - 0.5) < 0.1 && Math.abs(centerY - 0.5) < 0.1) && (
                  <li>
                  Directions to center:  
                  {Math.abs(centerY - 0.5) < 0.2 ? ' Slightly ' : ''}{directionY} and 
                  {Math.abs(centerX - 0.5) < 0.2 ? ' Slightly ' : ' '}{directionX}
                  </li>
                )}
                </ul>
              </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RTC;