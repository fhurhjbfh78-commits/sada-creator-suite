import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import PaymentPage from "./pages/PaymentPage";
import DrawingPage from "./pages/DrawingPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import LanguagePage from "./pages/LanguagePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DatabasePage from "./pages/DatabasePage";
import FeedPage from "./pages/FeedPage";
import GameCreatorPage from "./pages/GameCreatorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="max-w-md mx-auto min-h-[100dvh] relative overflow-hidden shadow-2xl">
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/drawing" element={<DrawingPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/language" element={<LanguagePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/database" element={<DatabasePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/game" element={<GameCreatorPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
