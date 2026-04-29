import AudioProcessor from "#/components/AudioProcessor";
import Button from "#/components/Button";
import ConversationHistory from "#/components/ConversationHistory";
import MessageList from "#/components/MessageList";
import { sendMessage } from "#/lib/conversations";
import { fetchMessageWithAudioBlob } from "#/lib/message";
import { cn } from "#/lib/utils";
import { useAuth, useUser } from "@clerk/tanstack-react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWindowSize } from "#/hooks/useWindowSize";
import { useSocket } from "#/lib/SocketContext";

const routeApi = getRouteApi("/dashboard");

const DashboardView = () => {
  const { getToken, signOut } = useAuth();
  const { user } = useUser();
  const [inputText, setInputText] = useState("");
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [isDecodingMessage, setIsDecodingMessage] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { conversationId } = routeApi.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const width = useWindowSize();
  const isDesktop = width >= 1024;
  const { client } = useSocket();

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
    if (!client || !client.connected || !conversationId) return;

    const subscription = client.subscribe(
      `/topic/conversations/${conversationId}/messages`,
      (message) => {
        const newMessage = JSON.parse(message.body);
        queryClient.setQueryData(
          ["messages", conversationId],
          (oldData: any) => (oldData ? [...oldData, newMessage] : [newMessage]),
        );
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, client?.connected]);

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

  return (
    <div className="flex flex-col h-screen p-2 gap-4 max-w-[1600px] mx-auto overflow-hidden md:p-6">
      <header className="flex justify-between items-center text-[10px] tracking-[0.4em] text-matrix-glow border-b border-matrix-ui pb-2 shrink-0 md:text-[11px]">
        <span className="hidden sm:inline">
          WAVE_WHISPER //<span className="hidden md:inline"> OPERATOR: </span>
          <span className="block md:inline">{user?.fullName}</span>
        </span>
        <Button onClick={handleSignOut} className="text-[9px] md:text-[11px]">
          <span className="block md:inline">TERMINATE_</span>
          <span className="block md:inline">SESSION</span>
        </Button>
        <Button
          onClick={toggleMenu}
          className="group text-[9px] px-2 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            <div className="w-5 h-1 border-none bg-matrix-glow group-hover:bg-matrix-bg" />
            <div className="w-5 h-1 border-none bg-matrix-glow group-hover:bg-matrix-bg" />
            <div className="w-5 h-1 border-none bg-matrix-glow group-hover:bg-matrix-bg" />
          </div>
        </Button>
      </header>

      <div className="flex-1 flex gap-6 min-h-0 relative mt-2">
        {" "}
        <div
          className={cn(
            "flex flex-col",
            isDesktop
              ? "relative shrink-0 w-96"
              : "w-[85%] max-w-96 fixed left-0 top-4 bottom-0 -translate-x-full transition-all duration-300 z-50",
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
                  <div className="flex-1 h-3 border border-matrix-ui flex items-center px-4 relative overflow-hidden bg-matrix-ui/5 md:h-4 lg:h-5">
                    <div
                      className={cn(
                        "bg-matrix-glow/30 h-full absolute block left-0 top-0 transition-all duration-1000 border-none border-matrix-glow",
                        mutation.isPending
                          ? "w-full border-r animate-pulse"
                          : "w-[0%]",
                        mutation.isSuccess
                          ? "w-[0%] border-none opacity-0"
                          : "block opacity-100",
                      )}
                    />
                    <span
                      className={cn(
                        "z-10 text-[6px] tracking-[0.3em] text-matrix-ui lg:text-[9px]",
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
                  conversationId={conversationId}
                  currentUserId={user?.id || ""}
                  selectedMessageId={selectedMessageId}
                  onSelectMessage={handleSelectMessage}
                />
              ) : (
                <div className="loading-text">NO_CONVERSATION_SELECTED...</div>
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
};

export default DashboardView;
