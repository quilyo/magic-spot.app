export type SubscriptionTier = 'none' | 'beta' | 'pro';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'past_due';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  starts_at: string;
  expires_at: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  subscription: Subscription | null;
  created_at: string;
}

// ======================================================
// BETA EXPIRATION DATE — Change this to control when beta ends
// Format: 'YYYY-MM-DDTHH:MM:SSZ' (UTC time)
// ======================================================
export const BETA_EXPIRY_DATE = '2026-12-31T23:59:59Z';

export const PLAN_DETAILS = {
  beta: {
    name: 'Beta Access',
    price: 'Free',
    description: 'Free access during our beta testing period',
    features: [
      'Real-time parking spot monitoring',
      'Interactive map view',
      'Navigate to available spots',
      'Auto-refresh data',
    ],
    badge: 'BETA',
    badgeColor: 'bg-amber-500',
  },
  pro: {
    name: 'Pro',
    price: '$4.99/mo',
    description: 'Full access to all MagicSpot features',
    features: [
      'Real-time parking spot monitoring',
      'Interactive map view',
      'Navigate to available spots',
      'Auto-refresh data',
      'Priority support',
      'Early access to new features',
    ],
    badge: 'PRO',
    badgeColor: 'bg-blue-600',
  },
} as const;
