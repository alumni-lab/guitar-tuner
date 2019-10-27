import React, { useEffect, useState } from "react";
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
  const dataArray = new Float32Array(analyser.frequencyBinCount);
  const source = audioContext.createMediaStreamSource(audio);
  analyser.fftSize = 2048;
  source.connect(analyser);

  let rafID = null; //request animation frame ID

  // let sign = "-";
  // if (detune === 0) {
  //   sign = "-";
  // } else if (detune < 0) {
  //   sign = "cents ♭";
  // } else if (detune > 0) {
  //   sign = "cents ♯";
  // }

  const cleanup = () => {
    window.cancelAnimationFrame(rafID);
    analyser.disconnect();
    source.disconnect();
  };

  function updatePitch() {
    analyser.getFloatTimeDomainData(dataArray);
    var ac = autoCorrelate(dataArray, audioContext.sampleRate);

    if (ac === -1) {
      //to be adjusted for element values
      // detectorClass = "vague";
      // pitchElem.innerText = "--";
      // noteElem.innerText = "-";
      // detuneElem.className = "";
      // detuneAmount.innerText = "--";
    } else {
      setPitch(Math.round(ac));
      // pitchElem.innerText = Math.round(pitch);
      // var note = noteFromPitch(ac);
      setNote(noteStrings(ac));
      // noteElem.innerHTML = noteStrings[note % 12];
      setDetune(centsOffFromPitch(ac, noteFromPitch(ac)));

      if (detune === 0) {
        // detuneElem.className = "";
        // detuneAmount.innerHTML = "--";
      } else {
        // if (detune < 0) detuneElem.className = "flat";
        // else detuneElem.className = "sharp";
        // detuneAmount.innerHTML = Math.abs(detune);
        // console.log("off by", detune);
      }
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    }
    rafID = window.requestAnimationFrame(updatePitch);
  }

  if (detune > 45 || detune< -45){
    console.log(detune)
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
      <div className="pitch">
        <span id="pitch">frequency: {pitch}</span>Hz
      </div>
      <div className="note">
        <span id="note">Note: {note}</span>
      </div>
      <canvas id="output" width="300" height="42"></canvas>
      <div id="detune">
        <span id="detune_amt">Off by: {detune}</span>
        {/* <span>{sign}</span> */}
      </div>
    </div>
  );
};

export default AudioAnalyser;
