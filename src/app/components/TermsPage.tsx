import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft, MapPin, Shield } from 'lucide-react';

export function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">MagicSpot</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-6 sm:p-10">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Terms and Conditions</h1>
            <p className="text-gray-500 text-sm mt-2">Last Updated: February 23, 2026</p>
          </div>

          {/* Sections */}
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">

            <Section title="1. Acceptance of Terms">
              By creating an account or using MagicSpot ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree, do not use the App.
            </Section>

            <Section title="2. Description of Service">
              MagicSpot provides real-time parking spot availability information using sensor and camera-based detection. The App displays parking spot status (available/occupied) on an interactive map.
            </Section>

            <Section title="3. Accuracy Disclaimer">
              <p className="font-semibold text-gray-900 uppercase mb-2">
                The App does not guarantee 100% accuracy.
              </p>
              <p className="mb-2">
                Parking spot availability data may be inaccurate, delayed, or unavailable due to, but not limited to:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Adverse weather conditions (rain, snow, fog, extreme heat)</li>
                <li>Physical obstructions (vehicles, debris, construction)</li>
                <li>Sensor or camera malfunctions</li>
                <li>Network connectivity issues or server downtime</li>
                <li>Rapid changes in parking conditions</li>
                <li>Environmental interference or lighting conditions</li>
              </ul>
              <p>
                You acknowledge that parking information is provided on an "as-is" and "as-available" basis and should be used as a guide only. Always verify spot availability in person before parking.
              </p>
            </Section>

            <Section title="4. No Liability for Parking Outcomes">
              <p className="mb-2">MagicSpot, its developers, affiliates, and partners shall not be held liable for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Parking tickets, fines, or towing resulting from reliance on the App</li>
                <li>Damage to vehicles or property</li>
                <li>Personal injury or accidents</li>
                <li>Loss of time, revenue, or opportunity</li>
                <li>Any indirect, incidental, or consequential damages</li>
              </ul>
            </Section>

            <Section title="5. Beta Program">
              The App is currently in a beta testing phase. Features may change, be removed, or malfunction without notice. Beta access may be revoked at any time at our sole discretion.
            </Section>

            <Section title="6. User Accounts">
              <ul className="list-disc pl-5 space-y-1">
                <li>You must provide accurate, current information when creating an account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must be at least 16 years of age to use the App</li>
                <li>One account per person; account sharing is prohibited</li>
              </ul>
            </Section>

            <Section title="7. Acceptable Use">
              <p className="mb-2">You agree NOT to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Reverse engineer, scrape, or extract data from the App</li>
                <li>Attempt to gain unauthorized access to systems or data</li>
                <li>Use the App for any unlawful purpose</li>
                <li>Interfere with the operation of the App or its infrastructure</li>
                <li>Redistribute or commercially exploit parking data without written consent</li>
              </ul>
            </Section>

            <Section title="8. Intellectual Property">
              All content, code, design, branding, and data within MagicSpot are the property of MagicSpot and its licensors. Map data is provided by OpenStreetMap contributors under the Open Database License.
            </Section>

            <Section title="9. Privacy & Data Collection">
              <ul className="list-disc pl-5 space-y-1">
                <li>We collect your email address and name for account management</li>
                <li>Location data is used solely to show your position on the map and is not stored on our servers</li>
                <li>We do not sell, share, or rent your personal information to third parties</li>
                <li>Account data is stored securely via Supabase with industry-standard encryption</li>
                <li>You may request deletion of your account and associated data at any time</li>
              </ul>
            </Section>

            <Section title="10. Subscriptions & Payments">
              <ul className="list-disc pl-5 space-y-1">
                <li>Beta access is provided free of charge during the beta period</li>
                <li>Paid subscriptions (when available) will be billed as described at the time of purchase</li>
                <li>We reserve the right to change pricing with 30 days' notice</li>
                <li>Refund policy for paid tiers will be disclosed at launch</li>
              </ul>
            </Section>

            <Section title="11. Service Availability">
              We do not guarantee uninterrupted access to the App. The service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
            </Section>

            <Section title="12. Technology & Third-Party Services">
              <p className="mb-2">The App uses various technologies and third-party services to provide parking detection functionality:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>AI-powered parking space detection using computer vision models licensed under Apache 2.0</li>
                <li>Location services and mapping data from OpenStreetMap and related services</li>
                <li>Cloud infrastructure and database services from Supabase</li>
                <li>Various open-source libraries and frameworks as documented in our project attributions</li>
              </ul>
            </Section>

            <Section title="13. Termination">
              We reserve the right to suspend or terminate your account at any time, with or without cause, and with or without notice. Upon termination, your right to use the App ceases immediately.
            </Section>

            <Section title="14. Limitation of Liability">
              <p className="font-semibold text-gray-900 uppercase">
                To the maximum extent permitted by law, MagicSpot and its developers shall not be liable for any damages arising from your use of or inability to use the App. Total liability shall not exceed the amount paid by you (if any) in the 12 months preceding the claim.
              </p>
            </Section>

            <Section title="15. Indemnification">
              You agree to indemnify and hold harmless MagicSpot, its developers, and affiliates from any claims, damages, or expenses arising from your use of the App or violation of these Terms.
            </Section>

            <Section title="16. Governing Law">
              These Terms shall be governed by and construed in accordance with the laws of the United States. Any disputes shall be resolved through binding arbitration.
            </Section>

            <Section title="17. Changes to Terms">
              We may update these Terms at any time. Continued use of the App after changes constitutes acceptance of the updated Terms. Material changes will be communicated via email or in-app notification.
            </Section>

            <Section title="18. Contact">
              For questions about these Terms, contact us at:{' '}
              <a href="mailto:mshelp@magic-spot.com" className="text-blue-600 hover:underline font-medium">
                mshelp@magic-spot.com
              </a>
            </Section>
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            <Button
              onClick={() => navigate(-1)}
              className="bg-gray-900 text-white hover:bg-gray-800 font-medium rounded-xl px-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-2">{title}</h2>
      <div className="text-gray-600">{children}</div>
    </div>
  );
}
