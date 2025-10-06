import type { Place } from "../types/place";

const ENDPOINT = "https://places.googleapis.com/v1/places:searchNearby";

// FieldMaskが必須
const FIELD_MASK = [
  "places.displayName",
  "places.location",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.types",
].join(",");

export interface NearbyParams {
  lat: number;
  lng: number;
  radiusMeters?: number;
  regionCode?: string;
}

export async function searchNearbyFood(params: NearbyParams): Promise<Place[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GOOGLE_MAPS_API_KEY が設定されていません。");
  }

  const body = {
    // 飲食系のみを対象
    includedTypes: ["restaurant", "cafe", "bakery", "bar"],
    // 人気順でソート
    rankPreference: "POPULARITY",
    maxResultCount: 20,
    regionCode: params.regionCode ?? "JP",
    locationRestriction: {
      circle: {
        center: { latitude: params.lat, longitude: params.lng },
        radius: params.radiusMeters ?? 1500,
      },
    },
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-FieldMask": FIELD_MASK,
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Places API エラー: ${res.status} ${res.statusText} - ${text}`
    );
  }

  const data = await res.json();
  const places: Place[] = data?.places ?? [];

  return places;
}
