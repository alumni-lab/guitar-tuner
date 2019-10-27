import React, { useEffect } from "react";
import {
  noteFromPitch,
  noteStrings,
  centsOffFromPitch,
  autoCorrelate
} from "./util/helpers.js";

const AudioAnalyser = ({ audio, setPitch, setNote, setDetune }) => {
  //state variables
  //start audio context and analyser
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const dataArray = new Float32Array(analyser.frequencyBinCount); // buffer
  const source = audioContext.createMediaStreamSource(audio);
  analyser.fftSize = 2048;
  source.connect(analyser);
  let rafID = null; //request animation frame ID

  function updatePitch() {
    analyser.getFloatTimeDomainData(dataArray);
    const ac = autoCorrelate(dataArray, audioContext.sampleRate);

    if (ac !== -1) {
      // -1 means no good correlation found
      setPitch(Math.round(ac));
      setNote(noteStrings(ac));
      setDetune(centsOffFromPitch(ac, noteFromPitch(ac)));
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    }
    //recursive calling itself with requestAnimationFrame, keeps updating until cleanup
    rafID = window.requestAnimationFrame(updatePitch);
  }

  const cleanup = () => {
    window.cancelAnimationFrame(rafID);
    analyser.disconnect();
    source.disconnect();
  };

  useEffect(() => {
    updatePitch();
    return () => {
      cleanup();
    };
  }, []);

  return <></>;
};

export default AudioAnalyser;
