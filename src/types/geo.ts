export type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; coords: GeolocationCoordinates }
  | { status: "error"; message: string };
