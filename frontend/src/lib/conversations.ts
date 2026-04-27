import { queryOptions } from "@tanstack/react-query";
import { type GetToken } from "@clerk/shared/types";
import { createApiClient } from "./api-client";
import type { Conversation } from "#/types";

export const fetchConversations = async (getToken: GetToken) => {
  const api = createApiClient(getToken);
  const response = await api<Conversation[]>("/api/conversations");

  return response;
};

export const createConversation = async (
  getToken: GetToken,
  receiverId: string,
) => {
  const api = createApiClient(getToken);
  return await api<Conversation>("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ receiverId }),
  });
};

export const conversationQueryOptions = (
  getToken: GetToken,
  enabled: boolean = true,
) =>
  queryOptions({
    queryKey: ["conversations"],
    queryFn: () => fetchConversations(getToken),
    enabled,
    staleTime: 1000 * 60 * 120, // 120 minutes
  });
