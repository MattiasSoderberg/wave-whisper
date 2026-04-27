import { createConversation } from "#/lib/conversations";
import { profileQueryOptions } from "#/lib/profile";
import type { Conversation } from "#/types";
import { getToken } from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";

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
  const { data: searchResults, isFetching } = useQuery(
    profileQueryOptions(getToken, searchQuery),
  );
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      await createConversation(getToken, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSearchQuery("");
    },
  });

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

      {searchQuery.length > 2 && (
        <div className="flex flex-col gap-2">
          <header className="text-[9px] text-matrix-ui italic">
            SEARCH_RESULTS:
          </header>
          {searchResults?.map((user) => (
            <button
              key={user.id}
              onClick={() => mutation.mutate(user.id)}
              className="text-left p-2 border border-transparent hover:border-matrix-glow hover:bg-matrix-glow/10 group"
            >
              <div className="text-[11px] text-matrix-bright">
                {user.username}
              </div>
              <div className="text-[9px] text-matrix-ui group-hover:text-matrix-glow">
                INITIALIZE_CONVERSATION
              </div>
            </button>
          ))}
        </div>
      )}
      <h2 className="absolute -top-3 left-4 bg-matrix-bg px-2 text-xs tracking-widest uppercase">
        CONVERSATION_HISTORY
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
