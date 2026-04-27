import Button from "#/components/Button";
import { SignInButton } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-full p-6 gap-6 max-w-6xl mx-auto">
      <div className="matrix-frame">
        <header className="flex justify-between items-center text-[10px] tracking-[0.4em] text-matrix-glow border-b border-matrix-ui py-0.5 px-1 pb-2">
          WAVE_WHISPER
        </header>
        <div className="px-10 py-12">
          <SignInButton>
            <Button>INITIALIZE_GOOGLE_AUTH_SEQUENZE</Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
