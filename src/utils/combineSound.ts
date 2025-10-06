import { createSound } from "./createSound";

export function CombinedSound(
  audioCtx: AudioContext,
  inputs: string[]
): AudioBuffer | null {
  if (!inputs || inputs.length === 0) {
    return null;
  }

  // 各inputに対してcreateSoundを呼び出し、AudioBufferの配列を生成
  const audioBuffers = inputs.map((input) => createSound(audioCtx, input));

  // 連結後のAudioBufferの情報を計算
  const numberOfChannels = audioBuffers[0].numberOfChannels;
  const sampleRate = audioBuffers[0].sampleRate;
  const totalLength = audioBuffers.reduce(
    (sum, buffer) => sum + buffer.length,
    0
  );

  // 連結後の音声データを格納する新しいAudioBufferを作成
  const combinedBuffer = audioCtx.createBuffer(
    numberOfChannels,
    totalLength,
    sampleRate
  );

  // 各AudioBufferのデータを新しいバッファにコピー
  let offset = 0;
  for (const buffer of audioBuffers) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sourceData = buffer.getChannelData(channel);
      const destData = combinedBuffer.getChannelData(channel);
      // sourceDataを、destDataのoffset位置にセットする
      destData.set(sourceData, offset);
    }
    offset += buffer.length;
  }

  // 連結されたAudioBufferを返す
  return combinedBuffer;
}
