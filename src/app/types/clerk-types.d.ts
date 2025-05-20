declare module '@clerk/nextjs' {
  export interface ClerkProviderProps {
    children: React.ReactNode;
  }

  export const authMiddleware: (options: {
    publicRoutes?: string[];
    ignoredRoutes?: string[];
    afterAuth?: (auth: {
      userId: string | null;
      isPublicRoute: boolean;
      sessionClaims?: {
        metadata?: {
          role?: 'admin' | 'student';
        };
      };
    }, req: import('next/server').NextRequest) => import('next/server').NextResponse | void;
  }) => any;

  export const ClerkProvider: (props: ClerkProviderProps) => JSX.Element;
  export const useAuth: () => {
    isLoaded: boolean;
    isSignedIn: boolean;
    userId: string | null;
  };
  export const useUser: () => {
    isLoaded: boolean;
    user: {
      id: string;
      publicMetadata: {
        role?: 'admin' | 'student';
      };
    } | null;
  };
} 