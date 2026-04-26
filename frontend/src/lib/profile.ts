import type { Profile } from "#/types";
import { createServerFn } from "@tanstack/react-start";

export const syncProfile = createServerFn({ method: "POST" })
  .inputValidator((data: Profile) => data)
  .handler(async ({ data }) => {
    console.log("Syncing profile with data:", data);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/profiles/sync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    console.log("Profile sync response status:", response);
    if (!response.ok) {
      throw new Error("Failed to sync profile");
    }

    return response.json();
  });
