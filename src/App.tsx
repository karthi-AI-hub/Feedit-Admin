
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Banners from "./pages/Banners";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import EmailSent from "./pages/EmailSent";
import SetNewPassword from "./pages/SetNewPassword";
import ProductPage from "./pages/ProductPage";
import PasswordChanged from "./pages/PasswordChanged";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Splash screen as root */}
          <Route path="/" element={<SplashScreen />} />
          
          {/* Login and Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/email-sent" element={<EmailSent />} />
          <Route path="/set-new-password" element={<SetNewPassword />} />
          <Route path="/password-changed" element={<PasswordChanged />} />

          {/* Main layout routes */}
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductPage />} />
            <Route path="products/edit/:id" element={<ProductPage />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="banners" element={<Banners />} />          
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
