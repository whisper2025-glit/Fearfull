import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn, useSignUp, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<null | "email" | "google" | "discord">(null);

  const isLoaded = signInLoaded && signUpLoaded;

  // If the user is already signed in, redirect away from auth and replace history
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      navigate("/", { replace: true });
    }
  }, [userLoaded, isSignedIn, navigate]);

  const onEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading("email");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        navigate("/", { replace: true });
      } else {
        toast.error("Additional verification is required to sign in.");
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Unable to sign in";
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const onEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setLoading("email");
    try {
      const result = await signUp.create({
        emailAddress: email,
        password: password,
      });

      if (result.status === "complete") {
        await setActiveSignUp({ session: result.createdSessionId });
        navigate("/", { replace: true });
      } else if (result.status === "missing_requirements") {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        toast.success("Please check your email for verification code.");
      } else {
        toast.error("Sign up process incomplete. Please try again.");
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Unable to sign up";
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const onOAuth = async (strategy: "oauth_google" | "oauth_discord") => {
    if (!isLoaded) return;
    setLoading(strategy === "oauth_google" ? "google" : "discord");
    try {
      if (mode === "signin" && signIn) {
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: "/",
          redirectUrlComplete: "/",
        });
      } else if (mode === "signup" && signUp) {
        await signUp.authenticateWithRedirect({
          strategy,
          redirectUrl: "/",
          redirectUrlComplete: "/",
        });
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "OAuth error";
      toast.error(message);
      setLoading(null);
    }
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setEmail("");
    setPassword("");
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="space-y-1 text-center mb-6">
            <h1 className="text-2xl font-semibold">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signin" ? "Sign in to your account" : "Sign up for a new account"}
            </p>
          </div>

          <div className="grid gap-3">
            <Button
              variant="outline"
              disabled={!isLoaded || loading === "google"}
              onClick={() => onOAuth("oauth_google")}
            >
              {loading === "google" && <LoadingSpinner size="sm" className="mr-2" />}
              Continue with Google
            </Button>
            <Button
              variant="outline"
              disabled={!isLoaded || loading === "discord"}
              onClick={() => onOAuth("oauth_discord")}
            >
              {loading === "discord" && <LoadingSpinner size="sm" className="mr-2" />}
              Continue with Discord
            </Button>
          </div>

          <div className="relative my-6">
            <Separator />
            <span className="absolute inset-0 -top-3 mx-auto w-fit bg-card px-2 text-xs text-muted-foreground">
              or continue with email
            </span>
          </div>

          <form onSubmit={mode === "signin" ? onEmailSignIn : onEmailSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={!isLoaded || !!loading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                disabled={!isLoaded || !!loading}
                required
              />
            </div>
            <Button type="submit" disabled={!isLoaded || loading === "email"}>
              {loading === "email" && <LoadingSpinner size="sm" className="mr-2" />}
              {mode === "signin" ? "Sign in" : "Sign up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={!!loading}
            >
              {mode === "signin"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
