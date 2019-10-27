import React, { useState } from 'react';
import AudioAnalyser from './AudioAnalyser';

const App = () =>{
  const [audio, setAudio] = useState(null)

  const getMicrophone = async () => {
    const audioStatus = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
    setAudio(audioStatus);
  }

  const stopMicrophone = async () => {
    audio.getTracks().forEach(track => track.stop());
    setAudio(null);
  }

  const toggleMicrophone= () => {
    if (audio) {
      stopMicrophone();
    } else {
      getMicrophone();
    }
  }

    return (
      <div className="App">
        {audio ? <AudioAnalyser audio={audio} /> : ''}
        <div className="controls">
          <button onClick={toggleMicrophone}>{audio ? 'Stop microphone' : 'Get microphone input'}</button>
        </div>
      </div>
    );

}

export default App;
