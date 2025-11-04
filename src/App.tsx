import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Capture from "./pages/Capture";
import Knowledge from "./pages/Knowledge";
import Models from "./pages/Models";
import Marketplace from "./pages/Marketplace";
import PromptMarketplace from "./pages/PromptMarketplace";
import Organizations from "./pages/Organizations";
import Categories from "./pages/Categories";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import CustomModels from "./pages/CustomModels";
import PromptPacksAdmin from "./pages/PromptPacksAdmin";
import Transcriptions from "./pages/Transcriptions";
import Notes from "./pages/Notes";
import ExtensionGuide from "./pages/ExtensionGuide";
import SystemTests from "./pages/SystemTests";
import PopulatePrompts from "./pages/PopulatePrompts";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth page without layout */}
          <Route path="/auth" element={<Auth />} />
          
          {/* All other routes with layout */}
          <Route
            path="/*"
            element={
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/capture" element={<Capture />} />
                  <Route path="/knowledge" element={<Knowledge />} />
                  <Route path="/models" element={<Models />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/prompt-marketplace" element={<PromptMarketplace />} />
                  <Route path="/organizations" element={<Organizations />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/custom-models" element={<CustomModels />} />
                  <Route path="/admin/prompt-packs" element={<PromptPacksAdmin />} />
                  <Route path="/transcriptions" element={<Transcriptions />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/extension-guide" element={<ExtensionGuide />} />
                  <Route path="/system-tests" element={<SystemTests />} />
                  <Route path="/populate-prompts" element={<PopulatePrompts />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
