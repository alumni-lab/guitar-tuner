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

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export function noteStrings(frequency) {
  return notes[noteFromPitch(frequency) % 12];
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

/// finds and return frequnecy/pitch
export function autoCorrelate(buf, sampleRate) {
  const MIN_SAMPLES = 0;
  const GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be
  const MAX_SAMPLES = Math.floor(buf.length / 2);
  let best_offset = -1;
  let best_correlation = 0;
  let foundGoodCorrelation = false;
  let correlations = new Array(MAX_SAMPLES);
  let lastCorrelation = 1;
  let rms = 0;

  //find root mean square of data from buffer
  //if less than 0.01 the signal is too weak to find good correlation
  for (let i of buf) {
    rms += i * i;
  }
  rms = Math.sqrt(rms / buf.length);
  if (rms < 0.01) {
    return -1;
  }

  for (let offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;

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
      // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
      // Now we need to tweak the offset - by interpolating between the values to the left and right of the
      // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
      // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
      // (anti-aliased) offset.

      // we know best_offset >=1,
      // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
      // we can't drop into this clause until the following pass (else if).
      const shift =
        (correlations[best_offset + 1] - correlations[best_offset - 1]) /
        correlations[best_offset];
      return sampleRate / (best_offset + 8 * shift);
    }
    lastCorrelation = correlation;
  }

  //regular exit, good correlation found without going through short circuit
  if (best_correlation > 0.01) {
    return sampleRate / best_offset;
  }
  // no good correlation found
  return -1;
}
