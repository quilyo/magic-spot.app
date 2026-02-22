import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface SubscriptionGateProps {
  children: ReactNode;
}

/**
 * Wraps content that requires an active subscription.
 * Redirects unauthenticated users to /login.
 * Redirects authenticated but unsubscribed users to /pricing.
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { isAuthenticated, loading, hasActiveSubscription, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admins bypass the subscription gate
  if (isAdmin) {
    return <>{children}</>;
  }

  if (!hasActiveSubscription) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}

/**
 * Wraps content that requires authentication only (no subscription needed).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * Wraps content that requires admin role.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
