import { SignIn } from "@clerk/clerk-react";

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                card: "bg-card border-border",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "bg-secondary border-border text-foreground hover:bg-secondary/80",
                formFieldInput: "bg-secondary border-border text-foreground",
                footerActionLink: "text-cyan-300 hover:text-cyan-200",
                footer: "text-muted-foreground"
              },
              layout: {
                socialButtonsPlacement: "top"
              }
            }}
            redirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
