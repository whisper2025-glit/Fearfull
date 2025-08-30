import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<null | "email" | "google" | "discord">(null);

  const onEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading("email");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        navigate("/");
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

  const onOAuth = async (strategy: "oauth_google" | "oauth_discord") => {
    if (!isLoaded) return;
    setLoading(strategy === "oauth_google" ? "google" : "discord");
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "OAuth error";
      toast.error(message);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="space-y-1 text-center mb-6">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </div>

          <div className="grid gap-3">
            <Button
              variant="outline"
              disabled={!isLoaded || loading === "google"}
              onClick={() => onOAuth("oauth_google")}
            >
              {loading === "google" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue with Google
            </Button>
            <Button
              variant="outline"
              disabled={!isLoaded || loading === "discord"}
              onClick={() => onOAuth("oauth_discord")}
            >
              {loading === "discord" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue with Discord
            </Button>
          </div>

          <div className="relative my-6">
            <Separator />
            <span className="absolute inset-0 -top-3 mx-auto w-fit bg-card px-2 text-xs text-muted-foreground">or continue with email</span>
          </div>

          <form onSubmit={onEmailSignIn} className="grid gap-4">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                disabled={!isLoaded || !!loading}
                required
              />
            </div>
            <Button type="submit" disabled={!isLoaded || loading === "email"}>
              {loading === "email" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
