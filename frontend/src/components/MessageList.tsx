import React, { useEffect, useRef } from "react";
import { cn, formatDateTime } from "#/lib/utils";
import { messagesQueryOptions } from "#/lib/conversations";
import { useAuth } from "@clerk/tanstack-react-start";
import { useQuery } from "@tanstack/react-query";

interface MessageListProps {
  conversationId: string | null;
  currentUserId: string | undefined;
  selectedMessageId: string | null;
  onSelectMessage: (messageId: string) => void;
}

const MessageList = ({
  conversationId,
  currentUserId,
  selectedMessageId,
  onSelectMessage,
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();
  const { data: messages = [], isPending: loading } = useQuery(
    messagesQueryOptions(getToken, conversationId!, !!conversationId),
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="animate-pulse text-[10px] text-matrix-ui">
          LOADING_MESSAGES...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex flex-col gap-4 p-4 h-full overflow-y-auto custom-scrollbar font-mono"
    >
      {messages.length === 0 && (
        <div className="text-matrix-ui text-[10px] italic">
          NO_MESSAGES_ON_THIS_CHANNEL.
        </div>
      )}

      {messages.map((msg) => {
        const isMe = msg.sender.id === currentUserId;

        return (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-full cursor-pointer md:max-w-[85%]",
              isMe ? "self-end items-end" : "self-start items-start",
            )}
          >
            <div className="flex gap-2 mb-1 text-[10px] tracking-widest uppercase">
              <span
                className={cn(
                  isMe ? "text-matrix-glow/60" : "text-matrix-glow/80",
                  selectedMessageId === msg.id && "text-matrix-glow",
                )}
              >
                {isMe ? "SOURCE_ORIGIN ME" : `SENDER: ${msg.sender.username}`}
              </span>
              <span
                className={cn(
                  "text-matrix-glow/60",
                  selectedMessageId === msg.id && "text-matrix-glow",
                )}
              >
                [{formatDateTime(msg.createdAt)}]
              </span>
            </div>

            <div
              onClick={() => msg.id && onSelectMessage(msg.id)}
              className={cn(
                "px-3 py-2 border text-sm leading-relaxed text-matrix-glow/80 hover:text-white",
                isMe
                  ? "border-matrix-ui bg-matrix-glow/5 shadow-[inset_0_0_10px_rgba(0,255,65,0.05)]"
                  : "border-matrix-ui/50 bg-matrix-glow/15 text-matrix-glow ",
                selectedMessageId === msg.id &&
                  "border-matrix-glow shadow-glow text-white",
              )}
            >
              {msg.filePath.split("/").slice(-1)[0]}{" "}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
