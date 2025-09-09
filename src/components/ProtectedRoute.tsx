import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = "/" }: ProtectedRouteProps) => {
  const { isSignedIn, isLoaded, user } = useUser();

  console.log('🛡️ ProtectedRoute check:', {
    isLoaded,
    isSignedIn,
    hasUser: !!user,
    userId: user?.id,
    path: window.location.pathname
  });

  // Show loading while Clerk is determining authentication state
  if (!isLoaded) {
    console.log('⏳ Clerk not loaded yet, showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not signed in
  if (!isSignedIn) {
    console.log(`❌ User not signed in, redirecting to ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  console.log('✅ User authenticated, rendering protected content');

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
