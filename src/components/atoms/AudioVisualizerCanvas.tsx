import { forwardRef } from "react";

export const AudioVisualizerCanvas = forwardRef<HTMLCanvasElement>((_, ref) => (
  <canvas
    ref={ref}
    style={{ backgroundColor: "#111", display: "block", width: "100%" }}
  />
));
