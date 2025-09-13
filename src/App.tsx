import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useUserSync } from "@/hooks/useUserSync";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Chats from "./pages/Chats";
import CreateCharacter from "./pages/CreateCharacter";
import EditCharacter from "./pages/EditCharacter";
import Profile from "./pages/Profile";
import CharacterProfile from "./pages/CharacterProfile";
import CreatorProfile from "./pages/CreatorProfile";
import Search from "./pages/Search";
import Bonus from "./pages/Bonus";
import AsteriskTestPage from "./pages/AsteriskTestPage";
import AuthPage from "./pages/AuthPage";
import ImageTest from "./pages/ImageTest";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import SsoCallback from "./pages/SsoCallback";
import { useEffect } from "react";
import { trackPageview } from "./lib/analytics";

const queryClient = new QueryClient();


const RouteChangeTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageview(location.pathname);
  }, [location.pathname]);
  return null;
};

const AppContent = () => {
  // Keep Supabase authenticated with Clerk and sync the user profile
  useSupabaseAuth();
  useUserSync();

  return (
    <BrowserRouter>
      <RouteChangeTracker />
      <Routes>
        <Route path="/sso-callback" element={<SsoCallback />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Index />} />
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
        <Route path="/edit/:characterId" element={
          <ProtectedRoute>
            <EditCharacter />
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
        <Route path="/search" element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        } />
        <Route path="/bonus" element={
          <ProtectedRoute>
            <Bonus />
          </ProtectedRoute>
        } />
        <Route path="/test-asterisk" element={
          <ProtectedRoute>
            <AsteriskTestPage />
          </ProtectedRoute>
        } />
        <Route path="/test-images" element={<ImageTest />} />
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
