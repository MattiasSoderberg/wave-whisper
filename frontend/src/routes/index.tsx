import Button from "#/components/Button";
import { SignInButton } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-full p-6 gap-6 max-w-6xl mx-auto">
      <div className="matrix-frame relative">
        <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-xs tracking-widest text-matrix-glow z-40">
          WAVE_WHISPER
        </h2>
        <div className="px-10 py-12">
          <SignInButton>
            <Button className="text-sm">INITIALIZE_GOOGLE_AUTH_SEQUENZE</Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
