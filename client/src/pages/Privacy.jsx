import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Icons
const ShieldIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

// Policy sections
const policySections = [
  {
    icon: <UserIcon />,
    title: 'Information We Collect',
    color: 'from-primary to-primary/70',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          We collect information you provide directly to us when you use our service, including:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5"><CheckIcon /></span>
            <span><strong>Account Information:</strong> Your email address and password when you create an account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5"><CheckIcon /></span>
            <span><strong>Family Data:</strong> Names, dates, photos, bios, and relationships you add to your family trees</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5"><CheckIcon /></span>
            <span><strong>Usage Data:</strong> Information about how you interact with our service to improve user experience</span>
          </li>
        </ul>
      </>
    )
  },
  {
    icon: <DatabaseIcon />,
    title: 'How We Use Your Information',
    color: 'from-secondary to-secondary/70',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          We use the information we collect to provide, maintain, and improve our services:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-secondary font-bold mt-0.5"><CheckIcon /></span>
            <span>To create and manage your family trees</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary font-bold mt-0.5"><CheckIcon /></span>
            <span>To send you service-related communications (e.g., security alerts)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary font-bold mt-0.5"><CheckIcon /></span>
            <span>To respond to your comments, questions, and requests</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary font-bold mt-0.5"><CheckIcon /></span>
            <span>To develop new features and improve our service</span>
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          <strong>We never sell your personal data to third parties.</strong> Your family trees are private by default.
        </p>
      </>
    )
  },
  {
    icon: <LockIcon />,
    title: 'Data Security',
    color: 'from-accent to-accent/70',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          We take the security of your data seriously and implement industry-standard measures to protect it:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold mt-0.5"><CheckIcon /></span>
            <span><strong>Encryption:</strong> All data is encrypted in transit using HTTPS/SSL</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold mt-0.5"><CheckIcon /></span>
            <span><strong>Password Security:</strong> Passwords are securely hashed and never stored in plain text</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold mt-0.5"><CheckIcon /></span>
            <span><strong>Access Controls:</strong> Only you can access your family trees unless you choose to share them</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold mt-0.5"><CheckIcon /></span>
            <span><strong>Regular Audits:</strong> We regularly review our security practices</span>
          </li>
        </ul>
      </>
    )
  },
  {
    icon: <ShieldIcon />,
    title: 'Your Rights & Choices',
    color: 'from-primary to-secondary',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          You have full control over your personal data:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5"><CheckIcon /></span>
            <span><strong>Access:</strong> View all your data anytime from your dashboard</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5"><CheckIcon /></span>
            <span><strong>Edit:</strong> Update or correct your information at any time</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5"><CheckIcon /></span>
            <span><strong>Delete:</strong> Remove individual family members or entire trees</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5"><CheckIcon /></span>
            <span><strong>Export:</strong> Download your data as JSON or PDF for backup</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5"><CheckIcon /></span>
            <span><strong>Account Deletion:</strong> Permanently delete your account and all data</span>
          </li>
        </ul>
      </>
    )
  },
  {
    icon: <MailIcon />,
    title: 'Contact Us',
    color: 'from-secondary to-accent',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          If you have any questions about this Privacy Policy or our data practices, we're here to help:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <MailIcon />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Email</div>
              <a href="mailto:privacy@familytree.com" className="text-primary hover:text-secondary transition-colors">
                privacy@familytree.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <MailIcon />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Support</div>
              <a href="mailto:support@familytree.com" className="text-primary hover:text-secondary transition-colors">
                support@familytree.com
              </a>
            </div>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed mt-4">
          We typically respond to privacy inquiries within 48 hours.
        </p>
      </>
    )
  }
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl">
              F
            </div>
            <span className="text-2xl font-bold text-primary">FamilyTree</span>
          </Link>
          <Link 
            to="/dashboard" 
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
              Privacy & Transparency
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Privacy{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Your privacy matters to us. We're committed to protecting your personal data 
              and being transparent about how we use it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="pb-24 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            {policySections.map((section, index) => (
              <motion.div
                key={section.title}
                className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${section.color} rounded-2xl flex items-center justify-center text-white flex-shrink-0`}>
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{section.title}</h2>
                  </div>
                </div>
                
                <div className="pl-20">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Principles */}
      <section className="pb-24 px-6 bg-white">
        <div className="container mx-auto">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-10 border border-primary/20">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Privacy Principles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Privacy by Default</h3>
                  <p className="text-gray-700 text-sm">Your trees are private unless you choose to share them</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Data Minimization</h3>
                  <p className="text-gray-700 text-sm">We only collect what's necessary to provide our service</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Transparency</h3>
                  <p className="text-gray-700 text-sm">Clear communication about what we collect and why</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24 px-6">
        <div className="container mx-auto">
          <motion.div
            className="bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl p-12 lg:p-16 text-center text-white relative overflow-hidden max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
                Have Questions About Your Privacy?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                We're here to help. Contact our privacy team anytime with questions or concerns 
                about your data.
              </p>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl text-lg font-bold hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                Contact Privacy Team
                <ArrowRightIcon />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl">
                F
              </div>
              <span className="text-2xl font-bold text-primary">FamilyTree</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 FamilyTree. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/about" className="hover:text-primary transition">About</Link>
              <Link to="/faq" className="hover:text-primary transition">FAQ</Link>
              <Link to="/contact" className="hover:text-primary transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Last Updated */}
      <div className="bg-gray-50 border-t border-gray-100 py-6 px-6">
        <div className="container mx-auto text-center text-sm text-gray-500">
          Last updated: <strong>September 11, 2026</strong>
        </div>
      </div>
    </div>
  );
}