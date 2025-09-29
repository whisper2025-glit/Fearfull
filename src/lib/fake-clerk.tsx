import { useMemo } from "react";

// Minimal, local, no-auth shims to replace Clerk React hooks/components
// This disables authentication flows while keeping the app compiling.

type UserLike = {
  id: string;
  fullName?: string | null;
  firstName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
  emailAddresses?: { emailAddress: string }[];
} | null;

export function useUser(): { isLoaded: boolean; isSignedIn: boolean; user: UserLike } {
  return { isLoaded: true, isSignedIn: false, user: null };
}

export function useClerk(): { signOut: () => Promise<void> } {
  return {
    async signOut() {
      // no-op
    },
  };
}

export function useAuth(): { isLoaded: boolean; isSignedIn: boolean; getToken: (opts?: any) => Promise<string | null> } {
  return {
    isLoaded: true,
    isSignedIn: false,
    async getToken() {
      return null;
    },
  };
}

export function useSignIn(): {
  isLoaded: boolean;
  signIn: {
    create: (args: any) => Promise<{ status: string; createdSessionId?: string }>
    authenticateWithRedirect: (args: any) => Promise<void>
  } | null;
  setActive: (args: any) => Promise<void>;
} {
  return {
    isLoaded: true,
    signIn: {
      async create() {
        return { status: "complete", createdSessionId: "local" };
      },
      async authenticateWithRedirect() {
        // no-op
      },
    },
    async setActive() {
      // no-op
    },
  };
}

export function useSignUp(): {
  isLoaded: boolean;
  signUp: {
    create: (args: any) => Promise<{ status: string; createdSessionId?: string }>
    prepareEmailAddressVerification: (args: any) => Promise<void>
    attemptEmailAddressVerification: (args: any) => Promise<{ status: string; createdSessionId?: string }>
    authenticateWithRedirect: (args: any) => Promise<void>
  } | null;
  setActive: (args: any) => Promise<void>;
} {
  return {
    isLoaded: true,
    signUp: {
      async create() {
        return { status: "complete", createdSessionId: "local" };
      },
      async prepareEmailAddressVerification() {
        // no-op
      },
      async attemptEmailAddressVerification() {
        return { status: "complete", createdSessionId: "local" };
      },
      async authenticateWithRedirect() {
        // no-op
      },
    },
    async setActive() {
      // no-op
    },
  };
}

export function AuthenticateWithRedirectCallback() {
  return null;
}
