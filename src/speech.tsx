// Speech.tsx
import Button from 'react-bootstrap/Button';

import React, { useState, useEffect } from 'react';
declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
  }
interface SpeechToTextProps {
  handleTranscript: (text: string) => void;  // Define the prop for handling transcript
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ handleTranscript }) => {
  const [transcript, setTranscript] = useState<string>('');  // Store speech-to-text result

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition: any;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  } else {
    console.warn('SpeechRecognition API is not supported in this browser.');
  }

  // Start Speech Recognition
  const startListening = () => {
    if (!recognition) return;
    recognition.start();
  };

  // Stop Speech Recognition
  const stopListening = () => {
    if (!recognition) return;
    recognition.stop();
  };

  // Capture the speech and convert it to text
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      const speechToText = Array.from(event.results as SpeechRecognitionResultList)
        .map((result) => (result[0] as SpeechRecognitionAlternative).transcript)
        .join('');  // Concatenate the recognized speech
      setTranscript(speechToText);  // Update state with recognized text
      handleTranscript(speechToText);  // Pass the transcript to the parent (App)
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };
  }, [recognition, handleTranscript]);

  return (
    <div>
      <h2>Speech to Text</h2>
      <Button onClick={startListening}>Start Listening</Button>
      <Button onClick={stopListening}>Stop Listening</Button>
      <p>{transcript ? `Transcript: ${transcript}` : 'No speech recognized yet.'}</p>
    </div>
  );
};

export default SpeechToText;
