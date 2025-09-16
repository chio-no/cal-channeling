import React, { useMemo } from "react";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useNearestPlace } from "../../hooks/useNearestPlace";
import { formatDistance } from "../../utils/distance";
import { H2, SmallMuted } from "../atoms/Text";
import { Spinner } from "../atoms/Spinner";
import { ErrorMessage } from "../atoms/ErrorMessage";
import { KeyValueList } from "../molecules/KeyValueList";
import { TextRow } from "../atoms/TextRow";
import { morseConvert } from "../../utils/convertMorse";
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
  // --- フックの呼び出しをすべて先頭に移動 ---

  const geo = useGeolocation();

  // geo が成功するまで coords は undefined になる
  const coords = geo.status === "success" ? geo.coords : undefined;
  // useNearestPlace は undefined を受け取っても 'canFetch' で処理をスキップするため安全
  const nearest = useNearestPlace(coords?.latitude, coords?.longitude);

  // nearest が成功するまで p は undefined になる
  const p = nearest.status === "success" ? nearest.place : undefined;

  // offering の計算（フックではないが、p に依存）
  const offering = p
    ? inferOffering(p.types, p.primaryTypeDisplayName?.text)
    : "飲食店"; // p がない場合のデフォルト値

  console.log(p);

  // useMemo も常に呼び出す
  const tags = useMemo(() => {
    if (!p) return []; // p がない場合は空配列

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
  }, [offering, p]); // p や offering が undefined の間も実行されるが問題ない

  // --- フックの呼び出し終わり ---

  // --- 早期リターン（フックの後なのでOK） ---

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

  // nearest.status === "success" が確定
  // p, offering, tags は既に計算済み

  const distanceText = formatDistance(nearest.distanceMeters);

  //モールス信号を得る
  const morseCode = morseConvert(p.primaryType);
  console.log(morseCode);

  return (
    <section className="section" aria-live="polite">
      <KeyValueList>
        <TextRow label="店名" value={p.displayName?.text ?? "-"} />
        <TextRow label="分類（主）" value={offering} />
        <TextRow label="距離" value={distanceText} />
      </KeyValueList>
    </section>
  );
};
