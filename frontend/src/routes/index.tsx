import Button from "#/components/Button";
import { authClient } from "#/lib/auth-client";
import { syncProfile } from "#/lib/profile";
// import { syncProfile } from "#/lib/profile";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const handleClick = () => {
    authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/dashboard",
      },
      {
        onSuccess: async () => {
          const session = await authClient.getSession();

          if (session.data?.user) {
            const { email, name: username, image } = session.data.user || {};
            const avatarUrl = image || "";

            const profile = await syncProfile({
              data: {
                email,
                username,
                avatarUrl,
              },
            });

            if (!profile) {
              throw new Error("Failed to sync profile");
            }

            redirect({ to: "/dashboard" });
          }
        },
      },
    );
  };

  return (
    <div className="flex flex-col justify-center items-center h-full p-6 gap-6 max-w-6xl mx-auto">
      <div className="matrix-frame">
        <header className="flex justify-between items-center text-[10px] tracking-[0.4em] text-matrix-glow border-b border-matrix-ui py-0.5 px-1 pb-2">
          WAVE_WHISPER
        </header>
        <div className="px-10 py-12">
          <Button onClick={handleClick}>INITIALIZE_GOOGLE_AUTH_SEQUENZE</Button>
        </div>
      </div>
    </div>
  );
}
