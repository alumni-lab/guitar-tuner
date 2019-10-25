import React, { useEffect, useState } from "react";

const AudioAnalyser = ({ audio }) => {
  const [pitch, setPitch] = useState();
  const [note, setNote] = useState();
  const [detune, setDetune] = useState();

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const dataArray = new Float32Array(analyser.frequencyBinCount);
  let source = audioContext.createMediaStreamSource(audio);
  analyser.fftSize = 2048;
  source.connect(analyser);

  //######helper functions to be moved to another file
  var noteStrings = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B"
  ];

  function noteFromPitch(frequency) {
    var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
  }

  function frequencyFromNoteNumber(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  function centsOffFromPitch(frequency, note) {
    return Math.floor(
      (1200 * Math.log(frequency / frequencyFromNoteNumber(note))) / Math.log(2)
    );
  }
  //######helper functions to be moved to another file

  var rafID = null; //for animationframe

  var MIN_SAMPLES = 0; // will be initialized when AudioContext is created.
  var GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be

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
      correlations[offset] = correlation; // store it, for the tweaking we need to do below.
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
        // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
        // Now we need to tweak the offset - by interpolating between the values to the left and right of the
        // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
        // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
        // (anti-aliased) offset.

        // we know best_offset >=1,
        // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
        // we can't drop into this clause until the following pass (else if).
        var shift =
          (correlations[best_offset + 1] - correlations[best_offset - 1]) /
          correlations[best_offset];
        return sampleRate / (best_offset + 8 * shift);
      }
      lastCorrelation = correlation;
    }
    if (best_correlation > 0.01) {
      // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
      return sampleRate / best_offset;
    }
    return -1;
    //	var best_frequency = sampleRate/best_offset;
  }

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
      setNote(noteStrings[noteFromPitch(ac) % 12]);
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

    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    rafID = window.requestAnimationFrame(updatePitch);
  }
  let sign = "-";
  if (detune === 0) {
    sign = "-";
  } else if (detune < 0) {
    sign = "cents ♭";
  } else if (detune > 0) {
    sign = "cents ♯";
  }

  useEffect(() => {
    updatePitch();
    return () => {
      source.disconnect();
      cancelAnimationFrame(rafID);
      analyser.disconnect();
      source.disconnect();
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
        <span id="detune_amt">Off by: {Math.abs(detune)}</span>
        <span>{sign}</span>
      </div>
    </div>
  );
};

export default AudioAnalyser;
