import type { Profile } from "#/types";
import { type GetToken } from "@clerk/shared/types";
import { createApiClient } from "./api-client";
import type { Po } from "@clerk/shared/index-B4_BYgBX";

export const syncProfile = async (getToken: GetToken, profile: Profile) => {
  const api = createApiClient(getToken);
  return await api("/api/profiles/sync", {
    method: "POST",
    body: JSON.stringify(profile),
  });
};
