import { queryOptions } from "@tanstack/react-query";
import { type GetToken } from "@clerk/shared/types";
import { createApiClient } from "./api-client";
import type { Conversation } from "#/types";

export const fetchConversations = async (getToken: GetToken) => {
  const api = createApiClient(getToken);
  const response = await api<Conversation[]>("/api/conversations");
  console.log("Fetch conversations response:", response);

  return response;
};

export const conversationQueryOptions = (getToken: GetToken) =>
  queryOptions({
    queryKey: ["conversations"],
    queryFn: () => fetchConversations(getToken),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
