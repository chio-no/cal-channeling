export function createSound(input: string): AudioBuffer {
  const audioCtx = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const duration = input === "0" ? 0.2 : 1.0; // 0: short, 1: long
  const sampleRate = audioCtx.sampleRate;
  const length = sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // Random waveform: mix random sine, square, and noise
  const freq = 220 + Math.random() * 660; // random frequency between 220Hz and 880Hz
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Randomly choose waveform type
    const waveType = Math.floor(Math.random() * 3);
    let value = 0;
    if (waveType === 0) {
      value = Math.sin(2 * Math.PI * freq * t); // sine
    } else if (waveType === 1) {
      value = Math.sign(Math.sin(2 * Math.PI * freq * t)); // square
    } else {
      value = (Math.random() * 2 - 1) * 0.5; // noise
    }
    // Envelope for smooth fade in/out
    const envelope = Math.sin((Math.PI * i) / length);
    data[i] = value * envelope;
  }

  return buffer;
}
