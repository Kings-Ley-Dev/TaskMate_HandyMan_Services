import { Toaster } from "@/components/ui/toaster"; 
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Services from "@/pages/Services";
import ProviderProfile from "@/pages/ProviderProfile";
import Blog from "@/pages/Blog";
import BlogDetails from "@/pages/BlogDetails";
import Resources from "@/pages/Resources";
import SuccessStories from "@/pages/SuccessStories";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import AdminLogin from "@/pages/auth/AdminLogin";
import AdminRegister from "@/pages/auth/AdminRegister";
import CustomerDashboard from "@/pages/dashboard/CustomerDashboard";
import ProviderDashboard from "@/pages/dashboard/ProviderDashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import PostJob from "@/pages/dashboard/PostJob";
import AllJobs from "@/pages/dashboard/AllJobs";
import CustomerJobDetails from "@/pages/dashboard/CustomerJobDetails";
import ProviderJobDetails from "@/pages/dashboard/ProviderJobDetails";
import Messages from "@/pages/dashboard/Messages";
import Profile from "@/pages/dashboard/Profile";
import JobHistory from "@/pages/dashboard/JobHistory";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ProviderProfile />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogDetails />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/admin" element={<AdminLogin />} />
            <Route path="/auth/admin/register" element={<AdminRegister />} />
            <Route path="/dashboard/profile" element={<Profile />} />
              <Route 
                path="/dashboard/customer" 
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/customer/post-job" 
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <PostJob />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/customer/all-jobs" 
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <AllJobs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/customer/jobs/:id" 
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <CustomerJobDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/provider" 
                element={
                  <ProtectedRoute allowedRoles={["provider", "admin"]}>
                    <ProviderDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/provider/jobs/:id" 
                element={
                  <ProtectedRoute allowedRoles={["provider", "admin"]}>
                    <ProviderJobDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/admin" 
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/dashboard/messages" element={<Messages />} />
              <Route path="/dashboard/job-history" element={<JobHistory />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
