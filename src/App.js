import React, { useState } from "react";
import AudioAnalyser from "./AudioAnalyser";
import Meter from "./Meter";
import Note from "./Note";

const App = () => {
  const [audio, setAudio] = useState(null);
  const [pitch, setPitch] = useState("-");
  const [note, setNote] = useState("-");
  const [detune, setDetune] = useState(0);

  const getMicrophone = async () => {
    const audioStatus = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
    setAudio(audioStatus);
  };

  const stopMicrophone = async () => {
    await audio.getTracks().forEach(track => track.stop());
    setAudio(null);
  };

  const toggleMicrophone = () => {
    if (audio) {
      stopMicrophone();
    } else {
      getMicrophone();
    }
  };

  return (
    <div className="App">
      {audio ? (
        <AudioAnalyser
          audio={audio}
          setPitch={setPitch}
          setNote={setNote}
          setDetune={setDetune}
        />
      ) : (
        ""
      )}
      <Meter detune={detune} />
      <Note pitch={pitch} note={note} />
      <button className="microphone" onClick={toggleMicrophone}>
        {audio ? "Stop microphone" : "Get microphone input"}
      </button>
    </div>
  );
};

export default App;
