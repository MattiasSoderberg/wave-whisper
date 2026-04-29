import { getProfileFromUser, profileOptions } from "#/lib/profile";
import { useAuth, useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, redirect } from "@tanstack/react-router";
import DashboardView from "#/components/DashboardView";
import { SocketProvider } from "#/lib/SocketContext";
import { useQuery } from "@tanstack/react-query";
import type { Profile } from "#/types";
import { getClerkAuth } from "#/lib/clerkAuth";

interface DashboardSearch {
  conversationId?: string;
}

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { userId } = await getClerkAuth();

    if (!userId) {
      throw redirect({ to: "/" });
    }
  },
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    return {
      conversationId: search.conversationId as string | undefined,
    };
  },
  component: Dashboard,
});

function Dashboard() {
  const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { data: profile, isLoading: isSyncing } = useQuery(
    profileOptions(getToken, getProfileFromUser(user)),
  );

  if (!authLoaded || !isSignedIn) {
    return;
  }

  if (!authLoaded || !userLoaded || isSyncing) {
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

  return (
    <SocketProvider user={profile as Profile} getToken={getToken}>
      <DashboardView />
    </SocketProvider>
  );
}
