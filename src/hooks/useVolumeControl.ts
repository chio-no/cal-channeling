import { useRef, useCallback } from "react";
import { haversineMeters } from "../utils/distance";
import type { LatLng } from "../types/place";

//const MAX_DISTANCE = 20; // 音量が0になる最大距離 (m)

export function calculateVolume(
  currentCoords: GeolocationCoordinates,
  targetLocation: LatLng
): number {
  const currentLatLng = {
    latitude: currentCoords.latitude,
    longitude: currentCoords.longitude,
  };

  const distance = haversineMeters(currentLatLng, targetLocation);
  // 距離が遠いほど音が小さくなるように音量を計算（線形減衰）
  // 距離が1500mで音量0、50mで音量100となるように線形計算
  const rawVolume = (100 * (1500 - distance)) / (1500 - 50);

  // 計算結果を0から100の範囲内に収める（クランプ処理）
  const clampedVolume = Math.max(0, Math.min(100, rawVolume));

  // Web Audio APIのGainNodeで扱うため、音量を0から1の範囲に正規化
  return clampedVolume / 100;
}

export function useVolumeControl(targetLocation?: LatLng) {
  const gainNodeRef = useRef<GainNode | null>(null);

  const setup = useCallback(
    (
      audioCtx: AudioContext,
      source: AudioBufferSourceNode,
      initialVolume: number
    ) => {
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(initialVolume, audioCtx.currentTime);
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNodeRef.current = gainNode;
    },
    []
  );

  const updateVolume = useCallback(
    (currentCoords: GeolocationCoordinates) => {
      if (!gainNodeRef.current || !targetLocation) {
        return;
      }

      const newVolume = calculateVolume(currentCoords, targetLocation);
      // gainの値をスムーズに変更
      gainNodeRef.current.gain.setTargetAtTime(
        newVolume,
        gainNodeRef.current.context.currentTime,
        0.1 // 0.5秒かけて変化
      );
    },
    [targetLocation]
  );

  return { setup, updateVolume, gainnode: gainNodeRef.current };
}
