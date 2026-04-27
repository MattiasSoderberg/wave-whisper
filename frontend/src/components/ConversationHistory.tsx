import type { Conversation } from "#/types";
import React from "react";

const Row = ({ conversation }: { conversation: Conversation }) => {
  return (
    <li className="flex justify-between items-center group hover:bg-matrix-ui/10 p-1">
      <span className="text-sm tracking-tighter">
        [0{conversation.id}. {conversation.userA.username} -{" "}
        {conversation.createdAt}]
      </span>
      <div className="flex gap-4 opacity-40 group-hover:opacity-100">
        <button className="text-[10px] hover:text-white flex items-center gap-1">
          PLAY
        </button>
        <button className="text-[10px] hover:text-white flex items-center gap-1">
          DECODE
        </button>
      </div>
    </li>
  );
};

const ConversationHistory = ({
  conversations,
}: {
  conversations: Conversation[];
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFetching, setIsFetching] = React.useState(false);

  return (
    <section className="flex-1 matrix-frame p-4 overflow-hidden flex flex-col">
      <div className="relative">
        <input
          className="w-full bg-black border border-matrix-ui p-2 text-[10px] text-matrix-bright focus:outline-none focus:border-matrix-glow"
          placeholder="SCAN_FOR_USERS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isFetching && (
          <div className="absolute right-2 top-2 animate-spin text-matrix-glow">
            /
          </div>
        )}
      </div>
      <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-xs tracking-widest uppercase">
        Signal History
      </h2>

      <ul className="flex-1 overflow-y-auto space-y-3 pt-4">
        {conversations.map((conversation) => (
          <Row key={conversation.id} conversation={conversation} />
        ))}
      </ul>
    </section>
  );
};

export default ConversationHistory;
