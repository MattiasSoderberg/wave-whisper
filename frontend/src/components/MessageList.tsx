import React, { useEffect, useRef } from "react";
import type { Message } from "#/types";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string | undefined;
}

const MessageList = ({
  messages,
  loading,
  currentUserId,
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scrolla till botten när nya meddelanden kommer
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse text-[10px] text-matrix-ui">
            DECRYPTING_PACKET_00{i}...
          </div>
        ))}
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
            className={`flex flex-col max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
          >
            {/* Metadata (Sender & Time) */}
            <div className="flex gap-2 mb-1 text-[8px] tracking-widest uppercase">
              <span className={isMe ? "text-matrix-glow" : "text-matrix-ui"}>
                {isMe ? "SOURCE_ORIGIN" : `SENDER: ${msg.sender.username}`}
              </span>
              <span className="text-matrix-ui/60">[{msg.createdAt}]</span>
            </div>

            {/* Message Content */}
            <div
              className={`
              px-3 py-2 border text-xs leading-relaxed
              ${
                isMe
                  ? "border-matrix-glow bg-matrix-glow/5 text-matrix-bright shadow-[inset_0_0_10px_rgba(0,255,65,0.05)]"
                  : "border-matrix-ui bg-matrix-ui/5 text-matrix-ui"
              }
            `}
            >
              {msg.filePath}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
