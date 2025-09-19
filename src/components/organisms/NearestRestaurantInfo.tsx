import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { usePeriodicGeolocation } from "../../hooks/usePeriodicGeolocation";
import {
  calculateVolume,
  useVolumeControl,
} from "../../hooks/useVolumeControl";
import { searchNearbyFood } from "../../services/googlePlaces";
import type { NearestState } from "../../hooks/useNearestPlace";
import { formatDistance, haversineMeters } from "../../utils/distance";
import { Spinner } from "../atoms/Spinner";
import { ErrorMessage } from "../atoms/ErrorMessage";
import { KeyValueList } from "../molecules/KeyValueList";
import { TextRow } from "../atoms/TextRow";
import { morseConvert } from "../../utils/convertMorse";
import { CombinedSound } from "../../utils/combineSound";

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

export interface NearestRestaurantInfoHandle {
  handlePlayMorse: () => void;
}

export const NearestRestaurantInfo = forwardRef<
  NearestRestaurantInfoHandle,
  {}
>((_, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const [targetPlaceState, setTargetPlaceState] = useState<NearestState>({
    status: "idle",
  });
  const hasFetchedNearestPlace = useRef(false);

  const periodicGeo = usePeriodicGeolocation(); // 5秒ごとに現在地を更新

  const p =
    targetPlaceState.status === "success" ? targetPlaceState.place : undefined;
  const { setup: setupVolume, updateVolume } = useVolumeControl(p?.location);

  useImperativeHandle(ref, () => ({
    handlePlayMorse,
  }));

  useEffect(() => {
    // 位置情報が取得でき、かつ店舗検索が未実行の場合に一度だけ実行
    if (periodicGeo.status === "success" && !hasFetchedNearestPlace.current) {
      hasFetchedNearestPlace.current = true; // 実行済フラグを立てる
      let aborted = false;
      const { latitude, longitude } = periodicGeo.coords;

      (async () => {
        try {
          setTargetPlaceState({ status: "loading" });
          const places = await searchNearbyFood({
            lat: latitude,
            lng: longitude,
          });

          if (aborted) return;
          if (!places.length) {
            setTargetPlaceState({ status: "empty" });
            return;
          }

          const here = { latitude, longitude };
          let best = places[0];
          let bestDist = Number.POSITIVE_INFINITY;
          for (const place of places) {
            const loc = place.location;
            if (!loc) continue;
            const d = haversineMeters(here, loc);
            if (d < bestDist) {
              bestDist = d;
              best = place;
            }
          }

          if (bestDist === Number.POSITIVE_INFINITY) {
            setTargetPlaceState({ status: "empty" });
          } else {
            setTargetPlaceState({
              status: "success",
              place: best,
              distanceMeters: bestDist,
            });
          }
        } catch (e: any) {
          if (aborted) return;
          setTargetPlaceState({
            status: "error",
            message: e?.message ?? "周辺検索でエラーが発生しました。",
          });
        }
      })();

      return () => {
        aborted = true;
      };
    }
  }, [periodicGeo]);

  useEffect(() => {
    // 5秒ごとに距離と音量を更新
    if (periodicGeo.status === "success" && p?.location) {
      updateVolume(periodicGeo.coords);
      const newDistance = haversineMeters(periodicGeo.coords, p.location);
      console.log("distance updated:", newDistance);
      setDistance(newDistance);
    }
  }, [periodicGeo, p?.location, updateVolume]);

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const offering = p
    ? inferOffering(p.types, p.primaryTypeDisplayName?.text)
    : "飲食店";

  const handlePlayMorse = async () => {
    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    if (periodicGeo.status !== "success" || !p?.location) {
      return;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    const currentAudioCtx = audioCtxRef.current;

    if (currentAudioCtx.state === "suspended") {
      await currentAudioCtx.resume();
    }
    const morseCode = morseConvert(p!.primaryType);
    const morseWave = CombinedSound(currentAudioCtx, morseCode);

    if (!morseWave) return;

    const source = currentAudioCtx.createBufferSource();
    source.buffer = morseWave;
    source.loop = true;

    const initialVolume = calculateVolume(periodicGeo.coords, p.location);
    setupVolume(currentAudioCtx, source, initialVolume);

    source.start();
    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  if (
    targetPlaceState.status === "idle" ||
    targetPlaceState.status === "loading"
  ) {
    return <Spinner />;
  }
  if (targetPlaceState.status === "error") {
    return <ErrorMessage message={targetPlaceState.message} />;
  }
  if (targetPlaceState.status === "empty") {
    return <p>周辺に対象の飲食店が見つかりませんでした。</p>;
  }

  const distanceText =
    distance !== null
      ? formatDistance(distance)
      : formatDistance(targetPlaceState.distanceMeters);

  return (
    <section className="section" aria-live="polite">
      <KeyValueList>
        <TextRow label="店名" value={p!.displayName?.text ?? "-"} />
        <TextRow label="分類（主）" value={offering} />
        <TextRow label="距離" value={distanceText} />
        <TextRow label="再生状態" value={isPlaying ? "再生中" : "停止中"} />
      </KeyValueList>
    </section>
  );
});
