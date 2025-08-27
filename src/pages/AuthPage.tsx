import { SignIn } from "@clerk/clerk-react";

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                card: "bg-gray-800 border-gray-700",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-400",
                socialButtonsBlockButton: "bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                formFieldInput: "bg-gray-700 border-gray-600 text-white",
                footerActionLink: "text-blue-400 hover:text-blue-300",
                footer: "text-gray-400"
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
