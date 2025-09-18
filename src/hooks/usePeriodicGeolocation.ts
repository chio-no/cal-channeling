import { useEffect, useState } from "react";
import type { GeoState } from "src/types/geo";

export function usePeriodicGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({
        status: "error",
        message: "このブラウザは位置情報取得に対応していません。",
      });
      return;
    }

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos: GeolocationPosition) => {
          setState({ status: "success", coords: pos.coords });
        },
        (err: GeolocationPositionError) => {
          console.error(err);
          setState({
            status: "error",
            message: err.message || "位置情報の取得に失敗しました。",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    // 初回の位置情報取得
    setState({ status: "loading" });
    getLocation();

    // 5秒ごとに位置情報を更新
    const intervalId = setInterval(getLocation, 5000);

    // クリーンアップ関数
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return state;
}
