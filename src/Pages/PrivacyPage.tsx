import React from 'react';
import PageLayout from '../components/PageLayout';

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
              
              {/* Introduction */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to MemeForge. We respect your privacy and are committed to protecting your personal data. 
                  This privacy policy explains how we collect, use, and safeguard your information when you use our 
                  meme generation platform.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using our service, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Information We Collect
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Personal Information
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Name and email address when you create an account</li>
                      <li>Profile information you choose to provide</li>
                      <li>Payment information for premium features</li>
                      <li>Communication preferences</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Usage Information
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Memes and images you create or upload</li>
                      <li>Interactions with other users' content</li>
                      <li>Search queries and browsing behavior</li>
                      <li>Device information and IP addresses</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Technical Information
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Browser type and version</li>
                      <li>Operating system</li>
                      <li>Access times and pages viewed</li>
                      <li>Cookies and similar technologies</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  How We Use Your Information
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h3 className="font-semibold text-blue-900 mb-2">Service Provision</h3>
                    <p className="text-blue-800 text-sm">
                      To provide, maintain, and improve our meme generation services
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl">
                    <h3 className="font-semibold text-green-900 mb-2">User Experience</h3>
                    <p className="text-green-800 text-sm">
                      To personalize your experience and provide relevant content
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl">
                    <h3 className="font-semibold text-purple-900 mb-2">Communication</h3>
                    <p className="text-purple-800 text-sm">
                      To send you updates, support messages, and marketing communications
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-xl">
                    <h3 className="font-semibold text-yellow-900 mb-2">Security</h3>
                    <p className="text-yellow-800 text-sm">
                      To protect against fraud, abuse, and security threats
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 rounded-xl">
                    <h3 className="font-semibold text-red-900 mb-2">Analytics</h3>
                    <p className="text-red-800 text-sm">
                      To analyze usage patterns and improve our platform
                    </p>
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Information Sharing
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
                </p>
                
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> We may share data with trusted third-party service providers who assist us in operating our platform</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred</li>
                  <li><strong>Consent:</strong> We may share information with your explicit consent</li>
                </ul>
              </section>

              {/* Data Security */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Data Security
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Encryption</h3>
                    <p className="text-gray-700 text-sm">
                      All data is encrypted in transit and at rest using industry-standard protocols
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Access Controls</h3>
                    <p className="text-gray-700 text-sm">
                      Strict access controls limit who can view your personal information
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Regular Audits</h3>
                    <p className="text-gray-700 text-sm">
                      We regularly audit our security practices and update them as needed
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Incident Response</h3>
                    <p className="text-gray-700 text-sm">
                      We have procedures in place to respond to security incidents quickly
                    </p>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Your Rights
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have certain rights regarding your personal information:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Access</h3>
                      <p className="text-gray-700 text-sm">Request a copy of your personal data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Correction</h3>
                      <p className="text-gray-700 text-sm">Request correction of inaccurate data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Deletion</h3>
                      <p className="text-gray-700 text-sm">Request deletion of your personal data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Portability</h3>
                      <p className="text-gray-700 text-sm">Request transfer of your data to another service</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                      5
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Objection</h3>
                      <p className="text-gray-700 text-sm">Object to processing of your personal data</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Cookies and Tracking
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your experience on our platform:
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h3 className="font-semibold text-blue-900 mb-2">Essential Cookies</h3>
                    <p className="text-blue-800 text-sm">
                      Required for basic functionality and security
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-xl">
                    <h3 className="font-semibold text-green-900 mb-2">Performance Cookies</h3>
                    <p className="text-green-800 text-sm">
                      Help us understand how visitors interact with our platform
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <h3 className="font-semibold text-purple-900 mb-2">Functional Cookies</h3>
                    <p className="text-purple-800 text-sm">
                      Remember your preferences and settings
                    </p>
                  </div>
                </div>
              </section>

              {/* Children's Privacy */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Children's Privacy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                </p>
              </section>

              {/* Changes to Policy */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Changes to This Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about this privacy policy or our data practices, please contact us:
                </p>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                      <p className="text-gray-700">privacy@memeforge.com</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
                      <p className="text-gray-700">support@memeforge.com</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 