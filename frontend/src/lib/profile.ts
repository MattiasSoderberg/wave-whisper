import type { Profile } from "#/types";
import { type GetToken, type UserResource } from "@clerk/shared/types";
import { createApiClient } from "./api-client";
import { queryOptions } from "@tanstack/react-query";

export const syncProfile = async (
  getToken: GetToken,
  profile: Omit<Profile, "id">,
) => {
  const api = createApiClient(getToken);
  return await api<Profile>("/api/profiles/sync", {
    method: "POST",
    body: JSON.stringify(profile),
  });
};

export const searchProfiles = async (getToken: GetToken, query: string) => {
  const api = createApiClient(getToken);
  const result = await api<Profile[]>(`/api/profiles/search?query=${query}`);

  return result;
};

export const getProfileFromUser = (user: UserResource | null | undefined) => {
  return {
    email: user?.primaryEmailAddress?.emailAddress || "",
    username: user?.fullName || "",
    avatarUrl: user?.imageUrl || "",
  } as Omit<Profile, "id">;
};

export const profileOptions = (
  getToken: GetToken,
  profile: Omit<Profile, "id">,
) =>
  queryOptions({
    queryKey: ["profile"],
    queryFn: () => syncProfile(getToken, profile),
  });

export const profileQueryOptions = (
  getToken: GetToken,
  query: string,
  enableLimit: number = 2,
) =>
  queryOptions({
    queryKey: ["profiles", query],
    queryFn: () => searchProfiles(getToken, query),
    enabled: query.length > enableLimit,
  });
