import Button from "#/components/Button";
import ConversationHistory from "#/components/ConversationHistory";
import { conversationQueryOptions } from "#/lib/conversations";
import { syncProfile } from "#/lib/profile";
import { useAuth, useUser } from "@clerk/tanstack-react-start";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { getToken, isLoaded: authLoaded, isSignedIn, signOut } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [isSynced, setIsSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: conversations, isPending: conversationsLoading } = useQuery(
    conversationQueryOptions(getToken),
  );
  console.log(
    "Dashboard conversations data:",
    conversations,
    "Loading:",
    conversationsLoading,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoaded && !isSignedIn) {
      navigate({ to: "/" });
    }

    async function initMatrixSession() {
      if (!authLoaded || !userLoaded || !user || isSynced) {
        return;
      }

      try {
        const token = await getToken({ template: "ww-template" });
        if (!token) throw new Error("ACCESS_TOKEN_NOT_FOUND");

        await syncProfile(getToken, {
          email: user.primaryEmailAddress?.emailAddress || "",
          username: user.fullName || "RECON_USER",
          avatarUrl: user.imageUrl,
        });

        setIsSynced(true);
      } catch (err) {
        console.error("SYNC_ERROR:", err);
        setError("FAILED_TO_INITIALIZE_PROFILE");
      }
    }

    initMatrixSession();
  }, [authLoaded, userLoaded, user, getToken, isSynced]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (!authLoaded || !isSignedIn) {
    return;
  }

  if (!authLoaded || !userLoaded || (user && !isSynced)) {
    return (
      <div className="flex h-screen items-center justify-center bg-matrix-bg font-mono">
        <div className="flex flex-col items-center gap-4">
          <span className="text-matrix-bright animate-pulse tracking-[0.5em]">
            INITIALIZING_SYSTEM_SYNC...
          </span>
          <div className="w-64 h-1 border border-matrix-ui">
            <div
              className="bg-matrix-bright h-full animate-[progress_2s_infinite]"
              style={{ width: "45%" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 p-10">{error}</div>;

  return (
    <div className="flex flex-col h-screen p-6 gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center text-[10px] tracking-[0.4em] text-matrix-glow border-b border-matrix-ui pb-2">
        <span>WAVE_WHISPER</span>
        <div className="flex gap-4">
          <Button onClick={handleSignOut}>SignOut</Button>
        </div>
      </header>

      {/* Signal History (Övre stora sektionen) */}
      <ConversationHistory conversations={conversations ? conversations : []} />

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
        {1 + 1 == 1 && (
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
        )}

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
