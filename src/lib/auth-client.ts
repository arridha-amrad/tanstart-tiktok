import { createAuthClient } from "better-auth/react";

export const { useSession, signUp, signOut, signIn } = createAuthClient();
