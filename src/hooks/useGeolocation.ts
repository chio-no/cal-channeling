import { useEffect, useState } from "react";

export type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; coords: GeolocationCoordinates }
  | { status: "error"; message: string };

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({
        status: "error",
        message: "このブラウザは位置情報取得に対応していません。",
      });
      return;
    }
    setState({ status: "loading" });

    const onSuccess = (pos: GeolocationPosition) => {
      setState({ status: "success", coords: pos.coords });
    };
    const onError = (err: GeolocationPositionError) => {
      console.log(err);
      setState({
        status: "error",
        message: err.message || "位置情報の取得に失敗しました。",
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
    console.log(navigator.geolocation);
  }, []);

  return state;
}
