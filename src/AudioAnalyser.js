import React, { useState, useEffect} from "react";
import AudioVisualiser from "./AudioVisualiser";

const AudioAnalyser = ({ audio }) => {
  const [audioData, setAudioData] = useState(new Uint8Array(0));
  const [rafId, setRafId] = useState(null)
 
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  const source = audioContext.createMediaStreamSource(audio);
  
  useEffect(() => {
    source.connect(analyser);
    setRafId(requestAnimationFrame(tick))
    return () => {
      cancelAnimationFrame(rafId);
      analyser.disconnect();
      source.disconnect();
    };
  }, []);

  const tick = () => {
    analyser.getByteTimeDomainData(dataArray);
    setAudioData(dataArray);
    setRafId(requestAnimationFrame(tick))
  };

  return <AudioVisualiser audioData={audioData} />;
};

export default AudioAnalyser;
