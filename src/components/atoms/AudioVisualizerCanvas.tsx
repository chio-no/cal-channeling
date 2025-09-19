import { forwardRef } from "react";

export const AudioVisualizerCanvas = forwardRef<HTMLCanvasElement>((_, ref) => (
  <canvas ref={ref} />
));
