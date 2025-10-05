import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "./pages/Splash";
import Onboarding1 from "./pages/Onboarding1";
import Onboarding2 from "./pages/Onboarding2";
import Onboarding3 from "./pages/Onboarding3";
import WalletConnect from "./pages/WalletConnect";
import WalletConnectSuccess from "./pages/WalletConnectSuccess";
import InviteOnly from "./pages/InviteOnly";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import DepositSuccess from "./pages/DepositSuccess";
import Farm from "./pages/Farm";
import Trade from "./pages/Trade";
import Referrals from "./pages/Referrals";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { PrivyProvider } from '@privy-io/react-auth'
import { PRIVY_APP_ID } from '@/config/constants';
import { useWallet } from '@/hooks/useWallet';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import React from "react";


const queryClient = new QueryClient();

import type { ReactNode } from 'react';
interface AuthRedirectProps {
  children: ReactNode;
}

const publicRoutes = [
  '/',
  '/onboarding/1',
  '/onboarding/2',
  '/onboarding/3',
  '/wallet-connect',
  '/wallet-connect/success',
  '/invite-only',
];

const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const { authenticated } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isPublic = publicRoutes.includes(location.pathname);
    if (!authenticated && !isPublic) {
      navigate('/');
    }
  }, [authenticated, location.pathname, navigate]);

  return <>{children}</>;
};

const App = () => (
  <PrivyProvider
    appId={import.meta.env.VITE_PRIVY_APP_ID}  
    config={{
      appearance: {
        theme: 'dark',
        accentColor: '#e4b300ff',
      },
      loginMethods: ['email', 'google', 'wallet'],
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthRedirect>
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/onboarding/1" element={<Onboarding1 />} />
              <Route path="/onboarding/2" element={<Onboarding2 />} />
              <Route path="/onboarding/3" element={<Onboarding3 />} />
              <Route path="/wallet-connect" element={<WalletConnect />} />
              <Route path="/wallet-connect/success" element={<WalletConnectSuccess />} />
              <Route path="/invite-only" element={<InviteOnly />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/deposit/success" element={<DepositSuccess />} />
              <Route path="/farm" element={<Farm />} />
              <Route path="/trade" element={<Trade />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthRedirect>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </PrivyProvider>
);

export default App;