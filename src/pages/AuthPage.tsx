import { useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-sm transform rotate-12"></div>
            </div>
            <span className="text-sm font-bold text-white">Joyland</span>
          </div>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Welcome to Joyland</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="signin" className="text-white data-[state=active]:bg-blue-600">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-white data-[state=active]:bg-blue-600">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="mt-6">
                <div className="flex justify-center">
                  <SignIn 
                    appearance={{
                      elements: {
                        formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                        card: "bg-transparent shadow-none",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton: "bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                        formFieldInput: "bg-gray-700 border-gray-600 text-white",
                        footerActionLink: "text-blue-400 hover:text-blue-300"
                      },
                      layout: {
                        socialButtonsPlacement: "top"
                      }
                    }}
                    redirectUrl="/"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-6">
                <div className="flex justify-center">
                  <SignUp 
                    appearance={{
                      elements: {
                        formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                        card: "bg-transparent shadow-none",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton: "bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                        formFieldInput: "bg-gray-700 border-gray-600 text-white",
                        footerActionLink: "text-blue-400 hover:text-blue-300"
                      },
                      layout: {
                        socialButtonsPlacement: "top"
                      }
                    }}
                    redirectUrl="/"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-400">
          By continuing, you agree to our{" "}
          <button className="text-blue-400 underline hover:text-blue-300">
            Terms of Service
          </button>{" "}
          and{" "}
          <button className="text-blue-400 underline hover:text-blue-300">
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
