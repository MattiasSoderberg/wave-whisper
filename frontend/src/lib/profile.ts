import type { Profile } from "#/types";
import { type GetToken } from "@clerk/shared/types";
import { createApiClient } from "./api-client";

export const syncProfile = async (getToken: GetToken, profile: Profile) => {
  const api = createApiClient(getToken);
  return await api("/api/profiles/sync", {
    method: "POST",
    body: JSON.stringify(profile),
  });
};

export const searchProfiles = async (getToken: GetToken, query: string) => {
  const api = createApiClient(getToken);
  return await api<Profile[]>(`/api/profiles/search?q=${query}`);
};
