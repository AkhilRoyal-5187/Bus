declare module "@clerk/nextjs" {
  export interface ClerkProviderProps {
    children: React.ReactNode;
  }

  export const ClerkProvider: React.FC<ClerkProviderProps>;
  export const SignInButton: React.FC<{ mode?: "modal" | "redirect"; children: React.ReactNode }>;
  export const SignUpButton: React.FC<{ mode?: "modal" | "redirect"; children: React.ReactNode }>;
  export const SignedIn: React.FC<{ children: React.ReactNode }>;
  export const SignedOut: React.FC<{ children: React.ReactNode }>;
  export const UserButton: React.FC<{ afterSignOutUrl?: string }>;
  
  export const authMiddleware: (options?: {
    publicRoutes?: string[];
    ignoredRoutes?: string[];
    afterAuth?: (auth: {
      userId: string | null;
      sessionId: string | null;
      getToken: () => Promise<string | null>;
    }, req: Request) => Promise<Response | void> | Response | void;
  }) => any;
} 