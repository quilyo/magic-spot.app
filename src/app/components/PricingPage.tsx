import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/hooks/useAuth';
import { activateBetaSubscription } from '@/app/services/subscription';
import { PLAN_DETAILS, BETA_EXPIRY_DATE } from '@/app/types/subscription';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import {
  Check,
  Sparkles,
  Crown,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';

export function PricingPage() {
  const { user, hasActiveSubscription, subscriptionTier, refreshProfile, loading: authLoading } = useAuth();
  const [activating, setActivating] = useState(false);
  const navigate = useNavigate();

  // Redirect to map if already subscribed
  useEffect(() => {
    if (hasActiveSubscription && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [hasActiveSubscription, authLoading, navigate]);

  const handleActivateBeta = async () => {
    if (!user) return;
    setActivating(true);
    try {
      await activateBetaSubscription(user.id);
      // Wait a bit for the database to commit
      await new Promise(resolve => setTimeout(resolve, 500));
      await refreshProfile();
      toast.success('Beta access activated! Welcome aboard.');
      navigate('/', { replace: true });
    } catch (error: any) {
      // If user already has a subscription, refresh and go to map
      if (error.message?.includes('already have an active subscription')) {
        await refreshProfile();
        navigate('/', { replace: true });
        return;
      }
      toast.error(error.message || 'Failed to activate beta');
    } finally {
      setActivating(false);
    }
  };

  const handleProSubscribe = () => {
    // TODO: Implement Stripe checkout
    toast.info('Pro subscriptions via Stripe coming soon! Use Beta access for now.');
  };

  const betaExpiryFormatted = new Date(BETA_EXPIRY_DATE).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // If the user already has an active subscription, send them straight to the map
  useEffect(() => {
    if (hasActiveSubscription) {
      navigate('/', { replace: true });
    }
  }, [hasActiveSubscription, navigate]);

  // Don't render the pricing page while redirecting
  if (hasActiveSubscription) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="text-center pt-12 pb-6 px-4">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Limited Time Beta
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Choose Your Plan
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto text-base sm:text-lg">
          Get access to real-time parking data. Subscribe to start finding spots instantly.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          {/* Beta Card */}
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-amber-300 p-6 sm:p-8 flex flex-col">
            <div className="absolute -top-3 left-6">
              <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {PLAN_DETAILS.beta.badge}
              </span>
            </div>

            <div className="mb-6 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold text-gray-900">{PLAN_DETAILS.beta.name}</h3>
              </div>
              <p className="text-sm text-gray-500">{PLAN_DETAILS.beta.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">Free</span>
              <span className="text-gray-500 ml-2 text-sm">until {betaExpiryFormatted}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {PLAN_DETAILS.beta.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleActivateBeta}
              disabled={activating}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl py-3 text-base shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30"
            >
              {activating ? 'Activating...' : 'Join Beta — Free'}
              {!activating && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {/* Pro Card */}
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 flex flex-col">
            <div className="absolute -top-3 left-6">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {PLAN_DETAILS.pro.badge}
              </span>
            </div>

            <div className="mb-6 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">{PLAN_DETAILS.pro.name}</h3>
              </div>
              <p className="text-sm text-gray-500">{PLAN_DETAILS.pro.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$4.99</span>
              <span className="text-gray-500 ml-1 text-sm">/month</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {PLAN_DETAILS.pro.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleProSubscribe}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 text-base shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30"
            >
              Subscribe with Stripe
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-xs text-gray-400 text-center mt-3">
              Stripe integration coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="text-center pb-8 px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400 text-sm">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>Secure payments</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
