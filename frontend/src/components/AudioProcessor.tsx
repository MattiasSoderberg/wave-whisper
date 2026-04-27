import React, { useState } from "react";
import type WaveSurfer from "wavesurfer.js";
import Visualizer from "./Visualizer";
import Button from "./Button";

interface AudioProcessorProps {
  url: string | null;
  isDecoding: boolean;
}

const AudioProcessor = ({ url, isDecoding }: AudioProcessorProps) => {
  const [wavesurfer, setWaveSurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const onReady = (ws: WaveSurfer) => {
    setWaveSurfer(ws);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
      setIsPlaying(wavesurfer.isPlaying());
    }
  };

  const handleStop = () => {
    if (wavesurfer) {
      wavesurfer.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Visualizer (Oscilloscope) */}
      <div className="col-span-8 matrix-frame p-4 relative">
        <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-[10px] tracking-widest text-matrix-glow">
          OSCILLOSCOPE
        </h2>
        {isDecoding ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-matrix-bright animate-pulse text-[9px] tracking-[0.3em]">
              DOWNLOADING_ENCRYPTED_AUDIO...
            </span>
          </div>
        ) : (
          <Visualizer url={url} onReady={onReady} />
        )}
      </div>

      {/* Player (Transceiver Controls) */}
      <div className="col-span-4 matrix-frame p-4 relative flex flex-col justify-between bg-matrix-ui/5">
        <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-[10px] tracking-widest text-matrix-glow">
          TRANSCEIVER_CONTROLS
        </h2>

        <div className="flex flex-col gap-4 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handlePlayPause}
              disabled={!url}
              className="text-[10px] disabled:opacity-30 disabled:cursor-default"
            >
              {isPlaying ? "PAUSE_SIGNAL" : "PLAY_SIGNAL"}
            </Button>
            <Button
              onClick={handleStop}
              disabled={!url}
              className="text-[10px] disabled:opacity-30 disabled:cursor-default"
            >
              ABORT_STREAM
            </Button>
          </div>

          {/* En liten extra detalj: Volym-indikator */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-matrix-ui tracking-tighter">
              GAIN_CONTROL
            </span>
            <div className="h-1 bg-matrix-ui/20 w-full relative">
              <div className="absolute top-0 left-0 h-full bg-matrix-glow w-[70%]" />
            </div>
          </div>
        </div>

        <button className="matrix-btn w-full py-2 text-xs border-matrix-bright text-matrix-bright bg-matrix-glow/10">
          RE-DECODE_PACKET
        </button>
      </div>
    </div>
  );
};

export default AudioProcessor;
