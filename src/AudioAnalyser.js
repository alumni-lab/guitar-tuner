import React, { useEffect, useState } from "react";
import Meter from "./Meter"
import Note from "./Note"
import {
  noteFromPitch,
  noteStrings,
  centsOffFromPitch,
  autoCorrelate
} from "./util/helpers.js";

const AudioAnalyser = ({ audio }) => {
  //state variables
  const [pitch, setPitch] = useState();
  const [note, setNote] = useState();
  const [detune, setDetune] = useState();
  //start audio context and analyser
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const dataArray = new Float32Array(analyser.frequencyBinCount); // buffer
  const source = audioContext.createMediaStreamSource(audio);
  analyser.fftSize = 2048;
  source.connect(analyser);
  let rafID = null; //request animation frame ID

  const cleanup = () => {
    window.cancelAnimationFrame(rafID);
    analyser.disconnect();
    source.disconnect();
  };

  function updatePitch() {
    analyser.getFloatTimeDomainData(dataArray);
    var ac = autoCorrelate(dataArray, audioContext.sampleRate);

    if (ac !== -1) {
      setPitch(Math.round(ac));
      setNote(noteStrings(ac));
      setDetune(centsOffFromPitch(ac, noteFromPitch(ac)));
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    }
    rafID = window.requestAnimationFrame(updatePitch);
  }

  useEffect(() => {
    console.log("analyser connected");

    updatePitch();
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div>     
      <Note pitch={pitch} note={note}/>
      <Meter detune={detune}/>
    </div>
  );
};

export default AudioAnalyser;
