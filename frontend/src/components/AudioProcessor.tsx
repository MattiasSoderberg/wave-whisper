import React, { useState } from "react";
import type WaveSurfer from "wavesurfer.js";
import Visualizer from "./Visualizer";
import Button from "./Button";
import { cn } from "#/lib/utils";

interface AudioProcessorProps {
  url: string | null;
  isDecoding: boolean;
  decodedMessage: string | null;
}

const AudioProcessor = ({
  url,
  isDecoding,
  decodedMessage,
}: AudioProcessorProps) => {
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
    <div className="grid grid-cols-12 gap-6 h-52 relative">
      {/* Player (Transceiver Controls) */}
      <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-[10px] tracking-widest text-matrix-glow z-40">
        TRANSCEIVER_CONTROLS
      </h2>
      <div className="col-span-12 matrix-frame p-4 relative flex flex-col justify-between bg-matrix-ui/5 overflow-hidden lg:col-span-6 xl:col-span-5">
        <div className="flex flex-col items-start gap-4 mt-2">
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
        </div>

        <div className="flex-1 border border-matrix-ui/30 bg-black/40 p-3 relative overflow-y-auto min-h-0 custom-scrollbar">
          <div className="absolute top-0 right-0 p-1 text-[7px] text-matrix-ui/40">
            PLAIN_TEXT_MODE
          </div>

          <div
            className={cn(
              "text-[12px] leading-relaxed text-matrix-ui wrap-break-words",
              decodedMessage && "text-matrix-bright",
            )}
          >
            {isDecoding ? (
              <span className="animate-pulse">_</span>
            ) : (
              <>
                <span className="text-matrix-ui mr-2">{">"}</span>
                {decodedMessage || "AWAITING_DECODED_OUTPUT..."}
                <span className="inline-block w-1.5 h-3 ml-1 bg-matrix-glow animate-pulse align-middle" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Visualizer (Oscilloscope) */}
      <div className="col-span-0 hidden matrix-frame p-4 relative lg:block lg:col-span-6 xl:col-span-7">
        <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-[10px] tracking-widest text-matrix-glow z-40">
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
    </div>
  );
};

export default AudioProcessor;
