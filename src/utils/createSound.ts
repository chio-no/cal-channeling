export function createSound(
  audioCtx: AudioContext,
  input: string
): AudioBuffer {
  let duration = 0;
  if (input === "0" || input === "2") {
    duration = 0.2; // short beep
    //モールス符号では文字間は短音分の隙間を開けるので
  } else {
    duration = 1.0; // long beep
  }

  const sampleRate = audioCtx.sampleRate;
  const length = sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  if (input === "2") {
    // 無音を作成
    for (let i = 0; i < length; i++) {
      let value = 0;
      // Envelope for smooth fade in/out
      const envelope = Math.sin((Math.PI * i) / length);
      data[i] = value * envelope;
    }
  } else {
    // Random waveform: mix random sine, square, and noise
    const freq = 220 + Math.random() * 660; // random frequency between 220Hz and 880Hz
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let value = 0;
      value = Math.sin(2 * Math.PI * freq * t); // sine
      // Envelope for smooth fade in/out
      const envelope = Math.sin((Math.PI * i) / length);
      data[i] = value * envelope;
    }
  }

  return buffer;
}
