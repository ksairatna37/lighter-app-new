import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
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
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { PRIVY_APP_ID } from '@/config/constants';
import { useWallet } from '@/hooks/useWallet';
import { useEffect, useState, useRef } from 'react';
import logo from "@/assets/logo.png";

const queryClient = new QueryClient();

import type { ReactNode } from 'react';
import WelcomeCongratulations from "./pages/WelcomeCongratulations";
import Unstake from "./pages/Unstake";

interface ProtectedRouteProps {
  children: ReactNode;
}

// Component to protect routes that require authentication
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { authenticated, ready } = usePrivy();
  const location = useLocation();

  // Wait for Privy to be ready before making decisions
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-light mx-auto mb-4"></div>
          <p className="text-golden-light font-extralight">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to splash page
  // Save the current location so we can redirect back after login
  if (!authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: ReactNode;
}

// Component for public routes (splash, onboarding, wallet-connect)
const PublicRoute = ({ children }: PublicRouteProps) => {
  const { authenticated, ready } = usePrivy();
  const location = useLocation();

  // Wait for Privy to be ready
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-light mx-auto mb-4"></div>
          <p className="text-golden-light font-extralight">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, handle redirection logic
  if (authenticated) {
    // Allow access to certain pages even when authenticated (onboarding flow)
    const allowedAuthenticatedPaths = [
      '/onboarding/1',
      '/onboarding/2',
      '/onboarding/3',
      '/wallet-connect',
      '/wallet-connect/success',
      '/invite-only'
    ];

    // If trying to access splash page while authenticated, go to dashboard
    if (location.pathname === '/') {
      return <Navigate to="/dashboard" replace />;
    }

    // If trying to access other public routes while authenticated, 
    // only allow if it's part of onboarding flow
    if (!allowedAuthenticatedPaths.includes(location.pathname)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Enhanced Authentication handler component that preserves current public page
const AuthHandler = ({ children }: { children: ReactNode }) => {
  const { authenticated, ready, user } = usePrivy();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasHandledAuth, setHasHandledAuth] = useState(false);
  const previousLocationRef = useRef(location.pathname);

  // Define route categories
  const publicRoutes = ['/', '/onboarding/1', '/onboarding/2', '/onboarding/3', '/wallet-connect', '/wallet-connect/success', '/invite-only'];
  const protectedRoutes = ['/welcome-congratulations', '/dashboard', '/deposit', '/farm', 'unstake', '/trade', '/referrals', '/profile'];

  const isPublicRoute = (path: string) => publicRoutes.includes(path);
  const isProtectedRoute = (path: string) => protectedRoutes.some(route => path.startsWith(route));

  useEffect(() => {
    if (ready && !hasHandledAuth) {
      console.log('Auth state changed:', {
        authenticated,
        ready,
        user: !!user,
        currentPath: location.pathname,
        previousPath: previousLocationRef.current
      });

      if (authenticated && user) {
        // Get the intended destination from location state
        const from = location.state?.from?.pathname;

        // If user was trying to access a protected route, redirect there
        if (from && isProtectedRoute(from)) {
          console.log('Redirecting to intended protected destination:', from);
          navigate(from, { replace: true });
        } else if (location.pathname === '/') {
          // If on splash page and authenticated, go to dashboard
          console.log('Authenticated user on splash, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        }
        // If user is on a public route (like onboarding), let them stay there

        setHasHandledAuth(true);
      } else if (!authenticated && ready) {
        // User is not authenticated and Privy is ready
        const currentPath = location.pathname;
        const previousPath = previousLocationRef.current;

        if (isProtectedRoute(currentPath)) {
          console.log('Unauthenticated user accessing protected route:', currentPath);

          // If the user was on a public page before trying to access protected route,
          // redirect them back to that public page instead of splash
          if (isPublicRoute(previousPath)) {
            console.log('Redirecting back to previous public page:', previousPath);
            navigate(previousPath, { replace: true, state: { from: location } });
          } else {
            // If no previous public page, redirect to splash
            console.log('Redirecting to splash page');
            navigate('/', { replace: true, state: { from: location } });
          }
        }

        setHasHandledAuth(true);
      }
    }

    // Update previous location reference
    previousLocationRef.current = location.pathname;
  }, [authenticated, ready, user, navigate, location, hasHandledAuth]);

  // Reset handler when location changes significantly
  useEffect(() => {
    // Only reset if moving between different types of routes
    const currentIsPublic = isPublicRoute(location.pathname);
    const currentIsProtected = isProtectedRoute(location.pathname);
    const previousIsPublic = isPublicRoute(previousLocationRef.current);
    const previousIsProtected = isProtectedRoute(previousLocationRef.current);

    if ((currentIsPublic && previousIsProtected) || (currentIsProtected && previousIsPublic)) {
      setHasHandledAuth(false);
    }
  }, [location.pathname]);

  return <>{children}</>;
};

// Smart navigation interceptor to handle protected route access from public pages
const NavigationInterceptor = ({ children }: { children: ReactNode }) => {
  const { authenticated, ready } = usePrivy();
  const location = useLocation();
  const navigate = useNavigate();
  const [lastPublicRoute, setLastPublicRoute] = useState<string>('/');

  const publicRoutes = ['/', '/onboarding/1', '/onboarding/2', '/onboarding/3', '/wallet-connect', '/wallet-connect/success', '/invite-only'];
  const protectedRoutes = ['/welcome-congratulations', '/dashboard', '/deposit', '/farm', 'unstake', '/trade', '/referrals', '/profile'];

  const isPublicRoute = (path: string) => publicRoutes.includes(path);
  const isProtectedRoute = (path: string) => protectedRoutes.some(route => path.startsWith(route));

  // Track the last public route the user was on
  useEffect(() => {
    if (isPublicRoute(location.pathname)) {
      setLastPublicRoute(location.pathname);
      console.log('Updated last public route:', location.pathname);
    }
  }, [location.pathname]);

  // Handle navigation to protected routes when not authenticated
  useEffect(() => {
    if (ready && !authenticated && isProtectedRoute(location.pathname)) {
      console.log('Intercepting navigation to protected route:', location.pathname);
      console.log('Redirecting back to last public route:', lastPublicRoute);

      // Show a brief message (optional)
      // You could add a toast notification here

      // Redirect back to the last public route instead of splash
      navigate(lastPublicRoute, {
        replace: true,
        state: {
          from: location,
          message: 'Please complete authentication to access this page'
        }
      });
    }
  }, [ready, authenticated, location.pathname, lastPublicRoute, navigate]);

  return <>{children}</>;
};

// Main App Routes component
const AppRoutes = () => {
  return (
    <NavigationInterceptor>
      <AuthHandler>
        <Routes>
          {/* Public Routes - Accessible without authentication */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Splash />
              </PublicRoute>
            }
          />
          <Route
            path="/onboarding/1"
            element={
              <PublicRoute>
                <Onboarding1 />
              </PublicRoute>
            }
          />
          <Route
            path="/onboarding/2"
            element={
              <PublicRoute>
                <Onboarding2 />
              </PublicRoute>
            }
          />
          <Route
            path="/onboarding/3"
            element={
              <PublicRoute>
                <Onboarding3 />
              </PublicRoute>
            }
          />
          <Route
            path="/wallet-connect"
            element={
              <PublicRoute>
                <WalletConnect />
              </PublicRoute>
            }
          />
          <Route
            path="/wallet-connect/success"
            element={
              <PublicRoute>
                <WalletConnectSuccess />
              </PublicRoute>
            }
          />
          <Route
            path="/invite-only"
            element={
              <PublicRoute>
                <InviteOnly />
              </PublicRoute>
            }
          />

          {/* Protected Routes - Require authentication */}
          <Route
            path="/welcome-congratulations"
            element={
              <ProtectedRoute>
                <WelcomeCongratulations  />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit"
            element={
              <ProtectedRoute>
                <Deposit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit/success"
            element={
              <ProtectedRoute>
                <DepositSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farm"
            element={
              <ProtectedRoute>
                <Farm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unstake"
            element={
              <ProtectedRoute>
                <Unstake />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trade"
            element={
              <ProtectedRoute>
                <Trade />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <Referrals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthHandler>
    </NavigationInterceptor>
  );
};

const App = () => (
  <PrivyProvider
    appId={PRIVY_APP_ID}
    config={{
      appearance: {
        theme: 'dark',
        accentColor: '#D4B679', // Your golden color
        logo: logo,
      },
      loginMethods: ['email', 'wallet'],
      embeddedWallets: {
        ethereum: {
          createOnLogin: 'users-without-wallets',
        },
      },
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </PrivyProvider>
);

export default App;