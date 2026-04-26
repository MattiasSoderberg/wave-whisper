import type { Profile } from "#/types";
import { createServerFn } from "@tanstack/react-start";

export const syncProfile = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; profile: Profile }) => data)
  .handler(async ({ data }) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/profiles/sync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify(data.profile),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to sync profile");
    }

    return response.json();
  });
