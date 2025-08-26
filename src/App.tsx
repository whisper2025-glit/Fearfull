import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUserSync } from "@/hooks/useUserSync";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Chats from "./pages/Chats";
import CreateCharacter from "./pages/CreateCharacter";
import Profile from "./pages/Profile";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import BotProfile from "./pages/BotProfile";

const queryClient = new QueryClient();

const AppContent = () => {
  // Sync user with Supabase when authenticated
  console.log('🏗️ AppContent rendering, calling useUserSync...');
  useUserSync();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } />
        <Route path="/chats" element={
          <ProtectedRoute>
            <Chats />
          </ProtectedRoute>
        } />
        <Route path="/chat/:characterId" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <CreateCharacter />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/bot-profile" element={
          <ProtectedRoute>
            {/** Static demo bot profile page replicating screenshots */}
            <div style={{ height: '100%' }}>
              {/* Lazy import to keep routing simple */}
            </div>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
