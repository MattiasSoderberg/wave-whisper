import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
  socialProviders: {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
    },
  },
});
