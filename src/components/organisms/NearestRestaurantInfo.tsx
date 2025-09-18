import React, { useEffect, useState, useRef } from "react";
import { usePeriodicGeolocation } from "src/hooks/usePeriodicGeolocation";
import { useVolumeControl } from "src/hooks/useVolumeControl";
import { useNearestPlace } from "../../hooks/useNearestPlace";
import { formatDistance, haversineMeters } from "../../utils/distance";
import { Spinner } from "../atoms/Spinner";
import { ErrorMessage } from "../atoms/ErrorMessage";
import { KeyValueList } from "../molecules/KeyValueList";
import { TextRow } from "../atoms/TextRow";
import { morseConvert } from "../../utils/convertMorse";
import { CombinedSound } from "../../utils/combineSound";

const audioCtx = new (window.AudioContext ||
  (window as any).webkitAudioContext)();

function inferOffering(types?: string[], primaryTypeDisplay?: string): string {
  // 1) primaryTypeDisplayName が来ていれば最優先（ローカライズ済み）
  if (primaryTypeDisplay) return primaryTypeDisplay;

  // 2) types から代表的なものを拾う（例: sushi_restaurant → 寿司）
  const map: Record<string, string> = {
    sushi_restaurant: "寿司",
    ramen_restaurant: "ラーメン",
    chinese_restaurant: "中華",
    italian_restaurant: "イタリアン",
    french_restaurant: "フレンチ",
    indian_restaurant: "インド料理",
    korean_restaurant: "韓国料理",
    thai_restaurant: "タイ料理",
    yakitori_restaurant: "焼き鳥",
    okonomiyaki_restaurant: "お好み焼き",
    tempura_restaurant: "天ぷら",
    udon_restaurant: "うどん",
    cafe: "カフェ",
    bakery: "ベーカリー",
    bar: "バー",
    restaurant: "レストラン",
  };
  if (types?.length) {
    for (const t of types) {
      if (map[t]) return map[t];
      if (t.endsWith("_restaurant")) {
        const head = t.replace("_restaurant", "").replace(/_/g, " ");
        return `${head} レストラン`;
      }
    }
  }
  return "飲食店";
}

export const NearestRestaurantInfo: React.FC = () => {
  //reactのhookはコンポーネントの先頭で呼び出すこと
  const [isPlaying, setIsPlaying] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const geo = usePeriodicGeolocation();
  const coords = geo.status === "success" ? geo.coords : undefined;
  const nearest = useNearestPlace(coords?.latitude, coords?.longitude);
  const p = nearest.status === "success" ? nearest.place : undefined;
  const { setup: setupVolume, updateVolume } = useVolumeControl(p?.location);

  useEffect(() => {
    if (geo.status === "success" && p?.location) {
      updateVolume(geo.coords);
      const newDistance = haversineMeters(geo.coords, p.location);
      setDistance(newDistance);
    }
  }, [geo, p?.location, updateVolume]);

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
    };
  }, []);

  // offering の計算（フックではないが、p に依存）
  const offering = p
    ? inferOffering(p.types, p.primaryTypeDisplayName?.text)
    : "飲食店"; // p がない場合のデフォルト値

  console.log(p);

  // useMemo も常に呼び出す
  // const tags = useMemo(() => {
  //   if (!p) return []; // p がない場合は空配列

  //   const arr: string[] = [];
  //   if (offering) arr.push(offering);
  //   // types のうち分かりやすい代表をいくつかタグ化
  //   (p.types ?? []).forEach((t) => {
  //     if (/restaurant$/.test(t) || ["cafe", "bakery", "bar"].includes(t)) {
  //       arr.push(t.replace(/_/g, " "));
  //     }
  //   });
  //   // 重複排除・先頭2-3件だけ表示
  //   return Array.from(new Set(arr)).slice(0, 3);
  // }, [offering, p]); // p や offering が undefined の間も実行されるが問題ない

  if (geo.status === "idle" || geo.status === "loading") {
    return <Spinner />;
  }
  if (geo.status === "error") {
    return <ErrorMessage message={geo.message} />;
  }

  // geo.status === "success" が確定

  if (nearest.status === "loading" || nearest.status === "idle") {
    return <Spinner />;
  }
  if (nearest.status === "error") {
    return <ErrorMessage message={nearest.message} />;
  }
  if (nearest.status === "empty") {
    return <p>周辺に対象の飲食店が見つかりませんでした。</p>;
  }

  const distanceText =
    distance !== null
      ? formatDistance(distance)
      : formatDistance(nearest.distanceMeters);

  //モールス信号を得る
  //!はnullアサーション演算子。nullやundefinedではないことを保証する
  const morseCode = morseConvert(p!.primaryType);

  //モールス信号を波形に変換
  const morseWave = CombinedSound(morseCode);

  const handlePlayMorse = () => {
    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
    } else if (morseWave) {
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const source = audioCtx.createBufferSource();
      source.buffer = morseWave;
      source.loop = true;
      setupVolume(audioCtx, source);

      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    }
  };

  return (
    <section className="section" aria-live="polite">
      <KeyValueList>
        <TextRow label="店名" value={p!.displayName?.text ?? "-"} />
        <TextRow label="分類（主）" value={offering} />
        <TextRow label="距離" value={distanceText} />
      </KeyValueList>
      <button onClick={handlePlayMorse}>play voice</button>
    </section>
  );
};
