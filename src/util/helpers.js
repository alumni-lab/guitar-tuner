//https://en.wikipedia.org/wiki/MIDI_tuning_standard for formula
//middleA - standard note frequency is 440
//semitone - half a tone between each note is 69 
//(https://en.wikipedia.org/wiki/Piano_key_frequencies formula uses 49)
//pitch vs frequency - sensation of a frequency is commonly referred to as the pitch of a sound

//convert frequency to note
export function noteFromPitch(frequency) {
  var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  return Math.round(noteNum) + 69;
}

// Use array to convert frequency to string

const notes = [
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
export function noteStrings(frequency){
  return notes[noteFromPitch(frequency) % 12]
}

//convert note to frequency
function frequencyFromNoteNumber(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

//find cents off from note
export function centsOffFromPitch(frequency, note) {
  return Math.floor(
    (1200 * Math.log(frequency / frequencyFromNoteNumber(note))) / Math.log(2)
  );
}
