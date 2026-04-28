import AudioProcessor from "#/components/AudioProcessor";
import Button from "#/components/Button";
import ConversationHistory from "#/components/ConversationHistory";
import MessageList from "#/components/MessageList";
import { fetchConversationMessages, sendMessage } from "#/lib/conversations";
import { fetchMessageWithAudioBlob } from "#/lib/message";
import { syncProfile } from "#/lib/profile";
import { cn } from "#/lib/utils";
import { useAuth, useUser } from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWindowSize } from "#/hooks/useWindowSize";

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
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [isDecodingMessage, setIsDecodingMessage] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { conversationId } = Route.useSearch();
  const navigate = useNavigate();
  const { data: messages, isPending: messagesLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchConversationMessages(getToken, conversationId!),
    enabled: !!conversationId,
  });
  const queryClient = useQueryClient();
  const width = useWindowSize();
  const isDesktop = width >= 1024;

  useEffect(() => {
    if (isDesktop) {
      setShowMenu(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    setInputText("");
    setSelectedMessageId(null);
    setDecodedMessage(null);
    if (activeTrack) {
      URL.revokeObjectURL(activeTrack);
      setActiveTrack(null);
    }
  }, [conversationId]);

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

  const handleSelectMessage = async (messageId: string) => {
    try {
      setIsDecodingMessage(true);

      if (activeTrack) {
        URL.revokeObjectURL(activeTrack);
      }

      const { decodedMessage, blobUrl } = await fetchMessageWithAudioBlob(
        getToken,
        messageId,
      );

      setSelectedMessageId(messageId);
      setDecodedMessage(decodedMessage);
      setActiveTrack(blobUrl);
    } catch (error) {
      console.error("Error fetching message:", error);
    } finally {
      setIsDecodingMessage(false);
    }
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
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
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
    <div className="flex flex-col h-screen p-2 gap-4 max-w-[1600px] mx-auto overflow-hidden md:p-6">
      <header className="flex justify-between items-center text-[10px] tracking-[0.4em] text-matrix-glow border-b border-matrix-ui pb-2 shrink-0">
        <span>
          WAVE_WHISPER //<span className="hidden md:inline"> OPERATOR: </span>
          <span className="block md:inline">{user?.fullName}</span>
        </span>
        {/* <div className="flex items-center gap-6">
          </div> */}
        <Button
          onClick={handleSignOut}
          className="text-[9px] py-1 hidden lg:inline-block"
        >
          <span className="block md:inline">TERMINATE_</span>
          <span className="block md:inline">SESSION</span>
        </Button>
        <Button
          onClick={toggleMenu}
          className="group text-[9px] py-1 px-2 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            <div className="w-5 h-1 border-none bg-matrix-glow group-hover:bg-matrix-bg" />
            <div className="w-5 h-1 border-none bg-matrix-glow group-hover:bg-matrix-bg" />
            <div className="w-5 h-1 border-none bg-matrix-glow group-hover:bg-matrix-bg" />
          </div>
        </Button>
      </header>

      <div className="flex-1 flex gap-6 min-h-0 relative">
        {" "}
        <div
          className={cn(
            "flex flex-col",
            isDesktop
              ? "relative shrink-0 w-96"
              : "w-[85%] max-w-96 fixed left-0 top-5 bottom-0 -translate-x-full transition-all duration-300 z-50",
            !isDesktop && showMenu && "translate-x-0",
          )}
        >
          <ConversationHistory activeId={conversationId} />
        </div>
        <main className="flex-1 flex flex-col gap-6 min-h-0 relative">
          <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-xs tracking-widest text-matrix-glow z-40">
            ENCRYPTED_COMMUNICATION
          </h2>
          <div className="flex-1 matrix-frame relative overflow-hidden flex flex-col">
            <div className="col-span-5 matrix-frame border-x-0 border-t-0 px-4 pt-1 pb-3 relative">
              <div className="flex flex-col h-full gap-2 mt-2">
                <div className="flex gap-3">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!conversationId || mutation.isPending}
                    className="matrix-input h-16 w-full flex-1 text-xs resize-none bg-black/50 custom-scrollbar disabled:opacity-80"
                    placeholder={
                      conversationId
                        ? "ENTER_TEXT_TO_ENCRYPT..."
                        : "SELECT_CONVERSATION_FIRST..."
                    }
                  />

                  <Button
                    onClick={handleSend}
                    disabled={!conversationId || !inputText.trim()}
                    className="disabled:opacity-30 disabled:cursor-default"
                  >
                    SEND
                  </Button>
                </div>

                <div className="flex gap-2 items-center">
                  <div className="flex-1 h-3 border border-matrix-ui flex items-center px-4 relative overflow-hidden bg-matrix-ui/5">
                    <div
                      className={cn(
                        "bg-matrix-glow/30 h-full absolute block left-0 top-0 transition-all duration-1000 border-r border-matrix-glow",
                        mutation.isPending ? "w-full animate-pulse" : "w-[0%]",
                        mutation.isSuccess
                          ? "w-[0%] opacity-0"
                          : "block opacity-100",
                      )}
                    />
                    <span
                      className={cn(
                        "z-10 text-[6px] tracking-[0.3em] text-matrix-ui",
                        mutation.isPending && "text-matrix-glow",
                      )}
                    >
                      {mutation.isPending
                        ? "UPLOADING_ENCRYPTED_PACKET..."
                        : "ENCODER_READY"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {conversationId ? (
                <MessageList
                  messages={messages || []}
                  loading={messagesLoading}
                  currentUserId={user?.id || ""}
                  selectedMessageId={selectedMessageId}
                  onSelectMessage={handleSelectMessage}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-matrix-ui animate-pulse text-xs">
                  NO_CONVERSATION_SELECTED...
                </div>
              )}
            </div>
          </div>

          <div className="w-full">
            <AudioProcessor
              url={activeTrack}
              isDecoding={isDecodingMessage}
              decodedMessage={decodedMessage}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
