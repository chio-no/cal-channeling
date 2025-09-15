import { useEffect, useMemo, useState } from "react";
import type { Place } from "../types/place";
import { searchNearbyFood } from "../services/googlePlaces";
import { haversineMeters } from "../utils/distance";

export type NearestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; place: Place; distanceMeters: number }
  | { status: "empty" }
  | { status: "error"; message: string };

export function useNearestPlace(lat?: number, lng?: number) {
  const [state, setState] = useState<NearestState>({ status: "idle" });

  const canFetch = useMemo(
    () => typeof lat === "number" && typeof lng === "number",
    [lat, lng]
  );

  useEffect(() => {
    if (!canFetch) return;
    let aborted = false;

    (async () => {
      try {
        setState({ status: "loading" });
        const places = await searchNearbyFood({
          lat: lat!,
          lng: lng!,
          radiusMeters: 1500,
          regionCode: "JP",
        });
        if (aborted) return;
        if (!places.length) {
          setState({ status: "empty" });
          return;
        }
        // 念のためクライアント側でも最短距離を算出
        const here = { latitude: lat!, longitude: lng! };
        let best = places[0];
        let bestDist = Number.POSITIVE_INFINITY;
        for (const p of places) {
          const loc = p.location;
          if (!loc) continue;
          const d = haversineMeters(here, loc);
          if (d < bestDist) {
            bestDist = d;
            best = p;
          }
        }
        if (bestDist === Number.POSITIVE_INFINITY) {
          setState({ status: "empty" });
        } else {
          setState({
            status: "success",
            place: best,
            distanceMeters: bestDist,
          });
        }
      } catch (e: any) {
        setState({
          status: "error",
          message: e?.message ?? "周辺検索でエラーが発生しました。",
        });
      }
    })();

    return () => {
      aborted = true;
    };
  }, [canFetch, lat, lng]);

  return state;
}
