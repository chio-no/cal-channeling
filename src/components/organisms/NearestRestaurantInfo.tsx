import React, { useMemo } from "react";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useNearestPlace } from "../../hooks/useNearestPlace";
import { formatDistance } from "../../utils/distance";
import { H2, SmallMuted } from "../atoms/Text";
import { Spinner } from "../atoms/Spinner";
import { ErrorMessage } from "../atoms/ErrorMessage";
import { KeyValueList } from "../molecules/KeyValueList";
import { TextRow } from "../atoms/TextRow";
import { Tag } from "../atoms/Tag";

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
  const geo = useGeolocation();

  if (geo.status === "idle" || geo.status === "loading") {
    return <Spinner />;
  }
  if (geo.status === "error") {
    return <ErrorMessage message={geo.message} />;
  }

  const { latitude, longitude } = geo.coords;

  const nearest = useNearestPlace(latitude, longitude);

  if (nearest.status === "loading" || nearest.status === "idle") {
    return <Spinner />;
  }
  if (nearest.status === "error") {
    return <ErrorMessage message={nearest.message} />;
  }
  if (nearest.status === "empty") {
    return <p>周辺に対象の飲食店が見つかりませんでした。</p>;
  }

  const p = nearest.place;
  const distanceText = formatDistance(nearest.distanceMeters);

  const offering = inferOffering(p.types, p.primaryTypeDisplayName?.text);

  const tags = useMemo(() => {
    const arr: string[] = [];
    if (offering) arr.push(offering);
    // types のうち分かりやすい代表をいくつかタグ化
    (p.types ?? []).forEach((t) => {
      if (/restaurant$/.test(t) || ["cafe", "bakery", "bar"].includes(t)) {
        arr.push(t.replace(/_/g, " "));
      }
    });
    // 重複排除・先頭2-3件だけ表示
    return Array.from(new Set(arr)).slice(0, 3);
  }, [offering, p.types]);

  return (
    <section className="section" aria-live="polite">
      <div className="header">
        <H2>最も近い飲食店</H2>
        <SmallMuted>（地図は表示しません／テキストのみ）</SmallMuted>
      </div>

      <KeyValueList>
        <TextRow label="店名" value={p.displayName?.text ?? "-"} />
        <TextRow label="分類（主）" value={offering} />
        <TextRow
          label="住所"
          value={p.shortFormattedAddress ?? p.formattedAddress ?? "-"}
        />
        <TextRow label="距離" value={distanceText} />
        <TextRow
          label="評価"
          value={
            (typeof p.rating === "number"
              ? `${p.rating.toFixed(1)} / 5`
              : "-") +
            (typeof p.userRatingCount === "number"
              ? `（${p.userRatingCount}件）`
              : "")
          }
        />
        <TextRow label="Web" value={p.websiteUri ?? "-"} />
      </KeyValueList>

      {!!tags.length && (
        <>
          <div style={{ height: 12 }} />
          <div className="tags" aria-label="タグ">
            {tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </>
      )}

      {p.editorialSummary?.text && (
        <>
          <div style={{ height: 12 }} />
          <SmallMuted>{p.editorialSummary.text}</SmallMuted>
        </>
      )}
    </section>
  );
};
