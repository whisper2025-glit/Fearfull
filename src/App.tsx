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
import CharacterProfile from "./pages/CharacterProfile";
import CreatorProfile from "./pages/CreatorProfile";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

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
        <Route path="/character/:characterId" element={
          <ProtectedRoute>
            <CharacterProfile />
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
        <Route path="/creator/:userId" element={
          <ProtectedRoute>
            <CreatorProfile />
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
