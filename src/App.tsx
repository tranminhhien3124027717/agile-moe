import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrentUserProvider } from "@/contexts/CurrentUserContext";

// Layouts
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EServiceLayout } from "@/components/layout/EServiceLayout";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TestSeed from "./pages/TestSeed";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AccountManagement from "./pages/admin/AccountManagement";
import StudentDetail from "./pages/admin/StudentDetail";
import TopUpManagement from "./pages/admin/TopUpManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import CourseStudents from "./pages/admin/CourseStudents";
import FeeProcessing from "./pages/admin/FeeProcessing";
import AdminSettings from "./pages/admin/AdminSettings";
import SeedData from "./pages/admin/SeedData";

// e-Service Pages
import EServiceDashboard from "./pages/eservice/EServiceDashboard";
import AccountBalance from "./pages/eservice/AccountBalance";
import CourseFees from "./pages/eservice/CourseFees";
import Profile from "./pages/eservice/Profile";
import Help from "./pages/eservice/Help";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrentUserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Index />} />

            {/* Test Seed Page */}
            <Route path="/test-seed" element={<TestSeed />} />

            {/* Admin Portal Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="accounts" element={<AccountManagement />} />
              <Route path="accounts/:accountId" element={<StudentDetail />} />
              <Route path="topup" element={<TopUpManagement />} />
              <Route path="courses" element={<CourseManagement />} />
              <Route
                path="courses/:courseId/students"
                element={<CourseStudents />}
              />
              <Route path="fees" element={<FeeProcessing />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="seed-data" element={<SeedData />} />
            </Route>

            {/* e-Service Portal Routes */}
            <Route path="/eservice" element={<EServiceLayout />}>
              <Route index element={<EServiceDashboard />} />
              <Route path="balance" element={<AccountBalance />} />
              <Route path="fees" element={<CourseFees />} />
              <Route path="profile" element={<Profile />} />
              <Route path="help" element={<Help />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CurrentUserProvider>
  </QueryClientProvider>
);

export default App;
