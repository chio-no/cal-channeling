import { forwardRef } from "react";

interface Props {
  width: number;
  height: number;
}

export const AudioVisualizerCanvas = forwardRef<HTMLCanvasElement, Props>(
  ({ width, height }, ref) => (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{ backgroundColor: "#111" }}
    />
  )
);
