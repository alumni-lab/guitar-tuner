import React, { useEffect, useState } from "react";
import {
  noteFromPitch,
  noteStrings,
  centsOffFromPitch
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

  var MIN_SAMPLES = 0; // will be initialized when AudioContext is created.
  var GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be

  /// finds and return frequnecy/pitch
  function autoCorrelate(buf, sampleRate) {
    var SIZE = buf.length;
    var MAX_SAMPLES = Math.floor(SIZE / 2);
    var best_offset = -1;
    var best_correlation = 0;
    var rms = 0;
    var foundGoodCorrelation = false;
    var correlations = new Array(MAX_SAMPLES);

    for (let i = 0; i < SIZE; i++) {
      var val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01)
      // not enough signal
      return -1;

    var lastCorrelation = 1;
    for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
      var correlation = 0;

      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs(buf[i] - buf[i + offset]);
      }
      correlation = 1 - correlation / MAX_SAMPLES;
      correlations[offset] = correlation;
      if (
        correlation > GOOD_ENOUGH_CORRELATION &&
        correlation > lastCorrelation
      ) {
        foundGoodCorrelation = true;
        if (correlation > best_correlation) {
          best_correlation = correlation;
          best_offset = offset;
        }
      } else if (foundGoodCorrelation) {
        var shift =
          (correlations[best_offset + 1] - correlations[best_offset - 1]) /
          correlations[best_offset];
        return sampleRate / (best_offset + 8 * shift);
      }
      lastCorrelation = correlation;
    }
    if (best_correlation > 0.01) {
      return sampleRate / best_offset;
    }
    return -1;
  }

  let sign = "-";
  if (detune === 0) {
    sign = "-";
  } else if (detune < 0) {
    sign = "cents ♭";
  } else if (detune > 0) {
    sign = "cents ♯";
  }

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

  useEffect(() => {
    console.log("analyser connected");

    updatePitch();
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
        <span id="detune_amt">Off by: {Math.abs(detune)}</span>
        <span>{sign}</span>
      </div>
    </div>
  );
};

export default AudioAnalyser;
