import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";

export const getClerkAuth = createServerFn().handler(async () => {
  const { userId } = await auth();

  return {
    userId,
  };
});
