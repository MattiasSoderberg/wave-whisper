import Button from "#/components/Button";
import { authClient } from "#/lib/auth-client";
import { getSession } from "#/lib/auth.functions";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      redirect({ to: "/" });
    }

    // return { user: session.user };
  },
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex flex-col h-screen p-6 gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center text-[10px] tracking-[0.4em] text-matrix-glow border-b border-matrix-ui pb-2">
        <span>WAVE_WHISPER</span>
        <div className="flex gap-4">
          <Button
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    redirect({ to: "/" });
                  },
                },
              })
            }
          >
            SignOut
          </Button>
        </div>
      </header>

      {/* Signal History (Övre stora sektionen) */}
      <section className="flex-1 matrix-frame p-4 overflow-hidden flex flex-col">
        <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-xs tracking-widest uppercase">
          Signal History
        </h2>

        <div className="flex-1 overflow-y-auto space-y-3 pt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center group hover:bg-matrix-ui/10 p-1"
            >
              <span className="text-sm tracking-tighter">
                [0{i}. SENDER_ID_{i} - TIMESTAMP_{i} - {i}.2s]
              </span>
              <div className="flex gap-4 opacity-40 group-hover:opacity-100">
                <button className="text-[10px] hover:text-white flex items-center gap-1">
                  PLAY
                </button>
                <button className="text-[10px] hover:text-white flex items-center gap-1">
                  DECODE
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nedre sektionen med Encoder, Visualizer & Player */}
      <div className="grid grid-cols-12 gap-6 h-48">
        {/* Encoder */}
        <div className="col-span-5 matrix-frame p-4">
          <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-xs tracking-widest">
            The Encoder
          </h2>
          <div className="flex flex-col h-full gap-2">
            <input
              className="matrix-input w-full text-xs"
              placeholder="ENTER_TEXT_FOR_ENCODING..."
            />
            <div className="flex-1 border border-matrix-ui flex items-center px-4 relative overflow-hidden">
              <div className="bg-matrix-ui/30 h-full absolute left-0 top-0 w-[45%]" />
              <span className="z-10 text-[10px] tracking-widest">
                ENCODING SIGNAL... 45%
              </span>
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="col-span-4 matrix-frame p-4">
          <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-xs tracking-widest">
            Visualizer
          </h2>
          <div className="w-full h-full bg-matrix-ui/10 flex items-end gap-[1px]">
            {/* Simulerad bars för wireframe */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="bg-matrix-glow w-full"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* Player */}
        <div className="col-span-3 matrix-frame p-4 flex flex-col justify-between">
          <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-xs tracking-widest">
            The Player
          </h2>
          <div className="flex justify-around items-center">
            <button className="text-matrix-ui hover:text-matrix-glow">
              PLAY
            </button>
            <button className="text-matrix-ui hover:text-matrix-glow">
              PAUSE
            </button>
            <button className="text-matrix-ui hover:text-matrix-glow">
              STOP
            </button>
          </div>
          <button className="matrix-btn w-full mt-2 !text-lg">DECODE</button>
        </div>
      </div>
    </div>
  );
}
