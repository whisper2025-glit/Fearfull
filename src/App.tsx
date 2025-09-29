import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import ImageTest from "./pages/ImageTest";
import NotFound from "./pages/NotFound";
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
  return (
    <BrowserRouter>
      <RouteChangeTracker />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/chat/:characterId" element={<Chat />} />
        <Route path="/character/:characterId" element={<CharacterProfile />} />
        <Route path="/create" element={<CreateCharacter />} />
        <Route path="/edit/:characterId" element={<EditCharacter />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/creator/:userId" element={<CreatorProfile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/bonus" element={<Bonus />} />
        <Route path="/test-asterisk" element={<AsteriskTestPage />} />
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
