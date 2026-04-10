import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft, MapPin, Lock } from 'lucide-react';

export function PrivacyPage() {
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
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-500 text-sm mt-2">Last Updated: April 9, 2026</p>
          </div>

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">

            <Section title="1. Introduction">
              MagicSpot ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, and safeguard your information when you use the MagicSpot mobile application.
            </Section>

            <Section title="2. Information We Collect">
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="font-medium text-gray-900">Account information:</span> Your name and email address when you register</li>
                <li><span className="font-medium text-gray-900">Location data:</span> Your device's GPS coordinates, used only to display your position on the parking map. This data is processed on your device and is never stored on our servers</li>
                <li><span className="font-medium text-gray-900">Usage data:</span> Basic app activity to maintain and improve the service</li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <ul className="list-disc pl-5 space-y-1">
                <li>To create and manage your account</li>
                <li>To show your location on the parking map</li>
                <li>To send account-related emails (confirmations, password resets)</li>
                <li>To improve app functionality and fix issues</li>
              </ul>
            </Section>

            <Section title="4. Data Sharing">
              We do not sell, rent, or share your personal information with third parties for marketing purposes.
              Your data may be shared only with:
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><span className="font-medium text-gray-900">Supabase:</span> Our database and authentication provider. Data is stored with industry-standard encryption</li>
                <li>Law enforcement if required by law</li>
              </ul>
            </Section>

            <Section title="5. Location Data">
              MagicSpot requests access to your device's location solely to display a "you are here" marker on
              the parking map. Location coordinates are never transmitted to or stored on our servers.
              You can deny or revoke location permission at any time in your device Settings — the app will
              continue to function without it.
            </Section>

            <Section title="6. Data Retention">
              Your account data (name and email) is retained as long as your account is active.
              You may request complete deletion of your account and all associated data at any time
              through the app's Account settings or by contacting us.
            </Section>

            <Section title="7. Children's Privacy">
              MagicSpot is not directed at children under 16. We do not knowingly collect personal
              information from children under 16. If you believe a child has provided us with personal
              information, please contact us immediately.
            </Section>

            <Section title="8. Security">
              We implement industry-standard security measures to protect your information, including
              encrypted data transmission (HTTPS) and secure storage via Supabase.
            </Section>

            <Section title="9. Your Rights">
              You have the right to:
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Withdraw consent for location access at any time</li>
              </ul>
            </Section>

            <Section title="10. Changes to This Policy">
              We may update this Privacy Policy from time to time. We will notify you of material changes
              via email or in-app notification. Continued use of the app after changes constitutes acceptance.
            </Section>

            <Section title="11. Contact Us">
              For any privacy-related questions or requests, contact us at:{' '}
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
