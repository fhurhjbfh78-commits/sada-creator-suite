import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { isRTL } from "@/i18n/translations";
import type { LangCode } from "@/i18n/translations";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
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
import DirectChatPage from "./pages/DirectChatPage";
import GameCreatorPage from "./pages/GameCreatorPage";
import PrivacyPage from "./pages/PrivacyPage";
import CollabPage from "./pages/CollabPage";
import LabPage from "./pages/LabPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-[100dvh] items-center justify-center gradient-bg"><div className="animate-spin w-8 h-8 border-2 border-muted-foreground border-t-primary rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppContent = () => {
  useTheme();
  const { language } = useAppStore();
  const dir = isRTL(language as LangCode) ? 'rtl' : 'ltr';
  return (
    <div className="max-w-md mx-auto min-h-[100dvh] relative overflow-hidden shadow-2xl" dir={dir}>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/drawing" element={<ProtectedRoute><DrawingPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/language" element={<ProtectedRoute><LanguagePage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/database" element={<ProtectedRoute><DatabasePage /></ProtectedRoute>} />
        <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
        <Route path="/direct-chat" element={<ProtectedRoute><DirectChatPage /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><GameCreatorPage /></ProtectedRoute>} />
        <Route path="/privacy" element={<ProtectedRoute><PrivacyPage /></ProtectedRoute>} />
        <Route path="/lab" element={<ProtectedRoute><LabPage /></ProtectedRoute>} />
        <Route path="/collab" element={<ProtectedRoute><CollabPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
