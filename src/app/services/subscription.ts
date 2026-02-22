import { supabase } from '@/utils/supabase/client';
import type { Subscription, SubscriptionTier } from '@/app/types/subscription';
import { BETA_EXPIRY_DATE } from '@/app/types/subscription';

/**
 * Activate a beta subscription for a user.
 * Beta subscriptions are free and expire at BETA_EXPIRY_DATE.
 */
export async function activateBetaSubscription(userId: string): Promise<Subscription> {
  // Check if user already has an active subscription
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (existing) {
    throw new Error('You already have an active subscription');
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      tier: 'beta',
      status: 'active',
      starts_at: now,
      expires_at: BETA_EXPIRY_DATE,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Cancel a subscription.
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (error) throw new Error(error.message);
}

/**
 * Get subscription for a specific user.
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data;
}

/**
 * Admin: Get all subscriptions with user info.
 */
export async function getAllSubscriptions(): Promise<any[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Admin: Update a user's subscription tier/status.
 */
export async function adminUpdateSubscription(
  subscriptionId: string,
  updates: { tier?: SubscriptionTier; status?: string; expires_at?: string | null }
): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (error) throw new Error(error.message);
}

/**
 * Admin: Create a subscription for a user.
 */
export async function adminCreateSubscription(
  userId: string,
  tier: SubscriptionTier,
  expiresAt?: string | null
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      tier,
      status: 'active',
      starts_at: now,
      expires_at: expiresAt || null,
      created_at: now,
      updated_at: now,
    });

  if (error) throw new Error(error.message);
}

/**
 * Admin: Get all user profiles.
 */
export async function getAllUsers(): Promise<any[]> {
  // Fetch profiles and subscriptions separately, then merge
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profileError) throw new Error(profileError.message);
  if (!profiles || profiles.length === 0) return [];

  const { data: subs, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (subError) {
    console.error('Error fetching subscriptions for admin:', subError);
  }

  // Merge subscriptions into profiles
  return profiles.map((profile: any) => {
    const userSubs = (subs || []).filter((s: any) => s.user_id === profile.id);
    return { ...profile, subscriptions: userSubs };
  });
}

/**
 * Admin: Update a user's role.
 */
export async function adminUpdateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

/**
 * Admin: Delete a user's subscription.
 */
export async function adminDeleteSubscription(subscriptionId: string): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', subscriptionId);

  if (error) throw new Error(error.message);
}

/**
 * For Stripe integration (future):
 * When you set up Stripe, you'll create a checkout session that redirects users
 * to Stripe's hosted checkout page. After payment, a webhook updates the
 * subscription in Supabase.
 *
 * Recommended setup:
 * 1. Create a Supabase Edge Function for Stripe webhooks
 * 2. Use Stripe Checkout Sessions for payment
 * 3. Store stripe_customer_id and stripe_subscription_id in subscriptions table
 *
 * For now, we use manual/beta subscriptions managed through the admin panel.
 */
export function getStripeCheckoutUrl(priceId: string, userId: string): string {
  // TODO: Replace with your actual Stripe checkout endpoint
  // This would typically call a Supabase Edge Function that creates a Stripe Checkout Session
  return `${window.location.origin}/api/checkout?price=${priceId}&user=${userId}`;
}
