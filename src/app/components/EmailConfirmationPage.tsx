import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { MapPin, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

export function EmailConfirmationPage() {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Email passed from signup navigate state
  const email = (location.state as any)?.email || '';

  useEffect(() => {
    // Supabase puts tokens in the URL hash: #access_token=...&refresh_token=...&type=signup
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.substring(1)); // strip the '#'
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');

    if (type === 'signup' && accessToken && refreshToken) {
      handleEmailConfirmation(accessToken, refreshToken);
    }
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleEmailConfirmation = async (accessToken: string, refreshToken: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) throw error;

      if (data.user) {
        setConfirmed(true);
        // Clear the hash from the URL so tokens aren't exposed
        window.history.replaceState(null, '', window.location.pathname);
        toast.success('Email confirmed! You can now sign in.');
        setTimeout(() => navigate('/login', { replace: true }), 2500);
      }
    } catch (err: any) {
      console.error('Email confirmation error:', err);
      setError(err.message || 'Failed to confirm email');
      toast.error('Failed to confirm email');
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    if (!email) {
      toast.info("Please go back and sign up again to receive a new confirmation email.");
      return;
    }
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/email-confirmation` },
      });
      if (error) throw error;
      toast.success('Confirmation email sent! Check your inbox.');
      setResendCooldown(60);
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend confirmation email');
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Confirming your email...</p>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MagicSpot</span>
            </div>

            <h2 className="text-center text-gray-900 mb-4 font-bold text-lg">
              Email Confirmed!
            </h2>

            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">
                Your email has been successfully confirmed. You can now sign in to your account.
              </p>
            </div>

            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl"
            >
              Continue to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MagicSpot</span>
            </div>

            <h2 className="text-center text-gray-900 mb-4 font-bold text-lg">
              Confirmation Failed
            </h2>

            <div className="mb-6">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {error}
              </p>
              <p className="text-sm text-gray-500">
                The confirmation link may be expired or invalid.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-xl"
              >
                Back to Sign In
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MagicSpot</span>
          </div>

          <h2 className="text-center text-gray-900 mb-4 font-bold text-lg">
            Check Your Email
          </h2>

          <div className="mb-6">
            <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              We've sent a confirmation link to{' '}
              {email ? <strong>{email}</strong> : 'your email address'}.
              Click the link to activate your account.
            </p>
            <p className="text-sm text-gray-500">
              Don't see the email? Check your spam folder.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={resendConfirmation}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-xl"
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend Confirmation Email'
              )}
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}