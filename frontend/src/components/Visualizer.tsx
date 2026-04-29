import React, { useEffect } from "react";
import WaveSurfer from "wavesurfer.js";

interface VisualizerProps {
  url: string | null;
  onReady: (ws: WaveSurfer) => void;
}

const Visualizer = ({ url, onReady }: VisualizerProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#003b11",
      progressColor: "#00ff41",
      cursorColor: "#d1ffd7",
      height: 100,
      barWidth: 2,
      normalize: true,
      url: url,
    });

    ws.on("ready", () => onReady(ws));
    ws.on("finish", () => ws.setTime(0));

    return () => ws.destroy();
  }, [url]);

  return (
    <div className="w-full h-full flex flex-col justify-center">
      {!url ? (
        <div className="text-[9px] text-matrix-ui text-center">
          AWAITING_SIGNAL_SOURCE...
        </div>
      ) : (
        <div ref={containerRef} className="w-full" />
      )}
    </div>
  );
};

export default Visualizer;
