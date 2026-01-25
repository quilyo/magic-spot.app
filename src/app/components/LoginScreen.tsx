import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { toast } from 'sonner';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, name: string) => Promise<void>;
}

const REMEMBERED_EMAIL_KEY = 'magicspot_remembered_email';
const KEEP_LOGGED_IN_KEY = 'magicspot_keep_logged_in';

export function LoginScreen({ onLogin, onSignup }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    const keepLoggedIn = localStorage.getItem(KEEP_LOGGED_IN_KEY);
    if (rememberedEmail && keepLoggedIn === 'true') {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Strong password validation for signup
    if (isSignup) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
    } else {
      // Basic validation for login
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
    }

    if (isSignup && !name) {
      toast.error('Please enter your name');
      return;
    }

    if (isSignup && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (isSignup && !agreedToTerms) {
      toast.error('Please agree to the Terms and Conditions');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await onSignup(email, password, name);
      } else {
        // Save or remove email based on "Remember me" checkbox
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
          localStorage.setItem(KEEP_LOGGED_IN_KEY, 'true');
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
          localStorage.removeItem(KEEP_LOGGED_IN_KEY);
        }
        await onLogin(email, password);
      }
    } catch (error: any) {
      console.error(`${isSignup ? 'Signup' : 'Login'} error:`, error);
      toast.error(error.message || `${isSignup ? 'Signup' : 'Login'} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/20 backdrop-blur-md rounded-lg shadow-2xl p-8 border border-white/30">
          
          <h2 className="text-center text-gray-900 mb-6 font-bold">
            {isSignup ? 'Create your account' : 'Sign in to access parking information'}
          </h2>

          {!isSignup && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-blue-900 text-center font-medium">
                👋 First time here? Click "Sign up" below to create an account
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <Label htmlFor="name" className="text-gray-900 font-medium">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-gray-900 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-900 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignup ? "Min 8 chars, uppercase, lowercase, number" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                disabled={loading}
              />
              {isSignup && password && (
                <div className="mt-1 text-xs space-y-1">
                  <div className={password.length >= 8 ? 'text-green-600 font-medium' : 'text-gray-700'}>
                    {password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </div>
                  <div className={/[A-Z]/.test(password) ? 'text-green-600 font-medium' : 'text-gray-700'}>
                    {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                  </div>
                  <div className={/[a-z]/.test(password) ? 'text-green-600 font-medium' : 'text-gray-700'}>
                    {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
                  </div>
                  <div className={/[0-9]/.test(password) ? 'text-green-600 font-medium' : 'text-gray-700'}>
                    {/[0-9]/.test(password) ? '✓' : '○'} One number
                  </div>
                </div>
              )}
            </div>

            {isSignup && (
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-900 font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                  disabled={loading}
                />
              </div>
            )}

            {isSignup && (
              <div className="flex items-start space-x-2 max-h-24 overflow-y-auto p-2 border border-white/30 rounded-md bg-white/10">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  disabled={loading}
                  className="mt-0.5 flex-shrink-0"
                />
                <Label htmlFor="terms" className="text-sm text-gray-900 cursor-pointer leading-tight">
                  I agree to the Terms and Conditions and Privacy Policy of this beta test. Parking spots state may not be accurate, this is a work in progress and we're happy you're part of it. Your email will be protected and never shared.
                </Label>
              </div>
            )}

            {!isSignup && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={loading}
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-900 cursor-pointer font-medium">
                  Keep me logged in
                </Label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gray-900 text-white hover:bg-gray-800 font-medium"
              disabled={loading}
            >
              {loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                const wasSignup = isSignup;
                setIsSignup(!isSignup);
                setName('');
                setPassword('');
                setConfirmPassword('');
                setAgreedToTerms(false);
                
                // If switching from signup to login, restore remembered email
                if (wasSignup) {
                  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
                  if (rememberedEmail) {
                    setEmail(rememberedEmail);
                    setRememberMe(true);
                  } else {
                    setEmail('');
                  }
                } else {
                  // Switching from login to signup, clear email
                  setEmail('');
                }
              }}
              className="text-sm text-gray-900 hover:text-gray-700 underline font-medium"
              disabled={loading}
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-700 font-medium">
            MagicSpot - Real-time Parking Monitoring
          </div>
        </div>
      </div>
    </div>
  );
}