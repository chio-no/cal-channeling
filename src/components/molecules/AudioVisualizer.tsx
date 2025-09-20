import React, { useRef, useEffect, useLayoutEffect } from "react";
import { AudioVisualizerCanvas } from "../atoms/AudioVisualizerCanvas";

interface Props {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  distance: number;
}

export const AudioVisualizer: React.FC<Props> = ({
  analyser,
  isPlaying,
  distance,
}) => {
  console.log(distance);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d")!;
    let animationFrameId: number;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      context.fillStyle = "#111";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.lineWidth = 2;
      context.strokeStyle = `rgb(${255 - distance},50,50)`;
      context.beginPath();

      if (isPlaying && analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
        const sliceWidth = (canvas.width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
          x += sliceWidth;
        }
        context.lineTo(canvas.width, canvas.height / 2);
      } else {
        // isPlayingがfalse、またはanalyserがない場合は中央に線を描画
        context.moveTo(0, canvas.height / 2);
        context.lineTo(canvas.width, canvas.height / 2);
      }
      context.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, analyser, distance]);

  return (
    <div className="visualizer-fullscreen">
      <AudioVisualizerCanvas ref={canvasRef} />
    </div>
  );
};
