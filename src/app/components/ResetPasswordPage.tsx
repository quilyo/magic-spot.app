import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { KeyRound, ArrowLeft, Check, Loader2, Smartphone } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

type ResetStep = 'request' | 'update' | 'done';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState<ResetStep>('request');
  const { resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();

  // Check if we arrived via a password recovery link
  useEffect(() => {
    const checkRecoverySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Check URL hash for recovery tokens
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery' || session) {
        // We're in recovery mode - show the update password form
        setStep('update');
      }
    };

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('update');
      }
    });

    checkRecoverySession();

    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      setStep('done');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Success screen — shown after password is updated
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h2>
            <p className="text-gray-500 text-sm mb-8">
              Your password has been successfully updated. You can now log in to the app with your new password.
            </p>
            <Button
              onClick={() => { window.location.href = 'magicspot://login'; }}
              className="w-full bg-gray-900 text-white hover:bg-gray-800 font-medium rounded-xl py-3 mb-3"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Return to App
            </Button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Continue on web instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Update password form (when coming from email link)
  if (step === 'update') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
              <p className="text-gray-500 mt-1 text-sm">Enter your new password below.</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <Label htmlFor="newPassword" className="text-gray-700 font-medium text-sm">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
                {newPassword && (
                  <div className="mt-2 text-xs space-y-1">
                    <div className={newPassword.length >= 8 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                    </div>
                    <div className={/[A-Z]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {/[A-Z]/.test(newPassword) ? '✓' : '○'} One uppercase letter
                    </div>
                    <div className={/[a-z]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {/[a-z]/.test(newPassword) ? '✓' : '○'} One lowercase letter
                    </div>
                    <div className={/[0-9]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {/[0-9]/.test(newPassword) ? '✓' : '○'} One number
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium text-sm">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-900 text-white hover:bg-gray-800 font-medium rounded-xl py-3"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Request reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-500 mt-1 text-sm">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-gray-500 text-sm mb-6">
                We sent a password reset link to <strong>{email}</strong>. 
                Click the link in the email to set a new password.
              </p>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-900 text-white hover:bg-gray-800 font-medium rounded-xl py-3"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 inline mr-1" />
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
