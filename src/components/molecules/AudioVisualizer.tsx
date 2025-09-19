import React, { useRef, useEffect, useLayoutEffect } from "react";
import { AudioVisualizerCanvas } from "../atoms/AudioVisualizerCanvas";

interface Props {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

export const AudioVisualizer: React.FC<Props> = ({ analyser, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      const { width } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = 100;
    }
  };

  useLayoutEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!isPlaying || !analyser || !canvas) {
      if (canvas) {
        const context = canvas.getContext("2d");
        context?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const context = canvas.getContext("2d")!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      context.fillStyle = "#111";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.lineWidth = 2;
      context.strokeStyle = "#646cff";
      context.beginPath();

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
      context.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, analyser]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", maxWidth: "686px", margin: "0 auto" }}
    >
      <AudioVisualizerCanvas ref={canvasRef} />
    </div>
  );
};
