import Button from "#/components/Button";
import ConversationHistory from "#/components/ConversationHistory";
import MessageList from "#/components/MessageList";
import { fetchConversationMessages, sendMessage } from "#/lib/conversations";
import { syncProfile } from "#/lib/profile";
import { cn } from "#/lib/utils";
import { useAuth, useUser } from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface DashboardSearch {
  conversationId?: string;
}

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    return {
      conversationId: search.conversationId as string | undefined,
    };
  },
  component: Dashboard,
});

function Dashboard() {
  const { getToken, isLoaded: authLoaded, isSignedIn, signOut } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [isSynced, setIsSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const { conversationId } = Route.useSearch();
  const navigate = useNavigate();
  const { data: messages, isPending: messagesLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchConversationMessages(getToken, conversationId!),
    enabled: !!conversationId,
  });
  const queryClient = useQueryClient();

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

  const mutation = useMutation({
    mutationFn: async (text: string) =>
      await sendMessage(getToken, conversationId!, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId!],
      });
      setInputText("");
    },
  });

  const handleSend = () => {
    if (!inputText.trim() || !conversationId || mutation.isPending) return;

    mutation.mutate(inputText);
    setInputText(""); // Rensa efter sändning
  };

  // Låt användaren trycka Enter för att skicka
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    <div className="flex flex-col h-screen p-6 gap-4 max-w-[1600px] mx-auto overflow-hidden">
      <header className="flex justify-between items-center text-[10px] tracking-[0.4em] text-matrix-glow border-b border-matrix-ui pb-2 shrink-0">
        <span>WAVE_WHISPER // SESSION_ID: {user?.id.slice(0, 8)}</span>
        <div className="flex items-center gap-6">
          <span className="text-matrix-ui">OPERATOR: {user?.fullName}</span>
          <Button onClick={handleSignOut} className="text-[9px] py-1">
            TERMINATE_SESSION
          </Button>
        </div>
      </header>

      <div className="flex-1 flex gap-6 min-h-0">
        {" "}
        <div className="w-72 flex flex-col shrink-0 xl:w-96">
          <ConversationHistory activeId={conversationId} />
        </div>
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          <div className="flex-1 matrix-frame relative overflow-hidden flex flex-col">
            <div className="col-span-5 matrix-frame p-4 relative">
              <div className="flex flex-col h-full gap-3 mt-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!conversationId || mutation.isPending}
                  className="matrix-input w-full flex-1 text-xs resize-none bg-black/50 disabled:opacity-30"
                  placeholder={
                    conversationId
                      ? "ENTER_TEXT_TO_ENCRYPT..."
                      : "SELECT_SIGNAL_FIRST..."
                  }
                />

                <div className="flex gap-2 items-center">
                  <div className="flex-1 h-8 border border-matrix-ui flex items-center px-4 relative overflow-hidden bg-matrix-ui/5">
                    <div
                      className={cn(
                        "bg-matrix-glow/30 h-full absolute block left-0 top-0 transition-all duration-1000 border-r border-matrix-glow",
                        mutation.isPending
                          ? "w-full animate-pulse"
                          : "invisible w-[0%]",
                      )}
                    />
                    <span className="z-10 text-[9px] tracking-[0.3em] text-matrix-bright">
                      {mutation.isPending
                        ? "UPLOADING_ENCRYPTED_PACKET..."
                        : "ENCODER_READY"}
                    </span>
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!conversationId || !inputText.trim()}
                    className="matrix-btn-sm h-8 px-4 cursor-pointer disabled:opacity-30 disabled:cursor-default"
                  >
                    SEND
                  </button>
                </div>
              </div>
            </div>
            <h2 className="absolute top-0.5 left-1 bg-matrix-bg px-2 text-xs tracking-widest text-matrix-glow z-10">
              ENCRYPTED_COMMUNICATION
            </h2>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {conversationId ? (
                <MessageList
                  messages={messages || []}
                  loading={messagesLoading}
                  currentUserId={user?.id || ""}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-matrix-ui animate-pulse text-xs">
                  NO_CONVERSATION_SELECTED...
                </div>
              )}
            </div>
          </div>

          <div className="h-56 grid grid-cols-12 gap-6 shrink-0">
            <div className="col-span-5 matrix-frame p-4 relative">
              <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-xs tracking-widest text-matrix-glow">
                ENCODER_UNIT
              </h2>
              <div className="flex flex-col h-full gap-3">
                <textarea
                  className="matrix-input w-full flex-1 text-xs resize-none bg-black/50"
                  placeholder="ENTER_TEXT_TO_ENCRYPT..."
                />
                <div className="h-8 border border-matrix-ui flex items-center px-4 relative overflow-hidden bg-matrix-ui/5">
                  <div className="bg-matrix-glow/20 h-full absolute left-0 top-0 w-[45%] border-r border-matrix-glow" />
                  <span className="z-10 text-[9px] tracking-[0.3em] text-matrix-bright">
                    PROCESSING_SIGNAL: 45%
                  </span>
                </div>
              </div>
            </div>

            {/* Visualizer */}
            <div className="col-span-4 matrix-frame p-4 relative">
              <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-xs tracking-widest text-matrix-glow">
                OSCILLOSCOPE
              </h2>
              <div className="w-full h-full bg-matrix-ui/5 flex items-center justify-center">
                {/* Här kommer WaveSurfer senare */}
                <div className="text-[9px] text-matrix-ui">
                  AWAITING_AUDIO_STREAM...
                </div>
              </div>
            </div>

            {/* Player */}
            <div className="col-span-3 matrix-frame p-4 relative flex flex-col justify-between">
              <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-xs tracking-widest text-matrix-glow">
                TRANSCEIVER
              </h2>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button className="matrix-btn-sm">PLAY</button>
                <button className="matrix-btn-sm">STOP</button>
              </div>
              <button className="matrix-btn w-full mt-auto py-2 text-matrix-bright border-matrix-bright bg-matrix-glow/10 hover:bg-matrix-glow/20">
                DECODE_INBOUND
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
