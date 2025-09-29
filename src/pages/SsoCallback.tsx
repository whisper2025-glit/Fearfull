import { AuthenticateWithRedirectCallback } from "@/lib/fake-clerk";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const SsoCallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="mt-4 text-muted-foreground">Finishing sign in…</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
};

export default SsoCallback;
