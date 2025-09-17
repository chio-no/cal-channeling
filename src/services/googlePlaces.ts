import type { Place } from "../types/place";

const ENDPOINT = "https://places.googleapis.com/v1/places:searchNearby";

// 取得するフィールド（FieldMask は必須）
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
  radiusMeters?: number; // default 1500
  // 日本語UIにしたい場合は regionCode: 'JP' を推奨（Accept-Languageは実装環境に依存）
  regionCode?: string; // e.g. 'JP'
}

export async function searchNearbyFood(params: NearbyParams): Promise<Place[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  console.log("API Key:", apiKey);
  if (!apiKey) {
    throw new Error("VITE_GOOGLE_MAPS_API_KEY が設定されていません。");
  }

  const body = {
    // 飲食系タイプのみを対象
    includedTypes: ["restaurant", "cafe", "bakery", "bar"],
    // 距離順ソート（返却順）。後段でも念のため距離計算して最小を選びます
    rankPreference: "DISTANCE",
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
      // Places API (New) は X-Goog-FieldMask が必須
      "X-Goog-FieldMask": FIELD_MASK,
      "X-Goog-Api-Key": apiKey,
      // 言語ローカライズは必要に応じて Accept-Language を追加してもよい
      // 'Accept-Language': 'ja'
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
