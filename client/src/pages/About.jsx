import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Icons
const HeartIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// Values data
const values = [
  {
    icon: <ShieldIcon />,
    title: 'Privacy First',
    desc: 'Your family data is encrypted and private by default. Only you control who sees your tree.',
    color: 'from-primary to-primary/70'
  },
  {
    icon: <UsersIcon />,
    title: 'Accessibility',
    desc: 'Easy to use for all ages and technical skill levels. No genealogy expertise required.',
    color: 'from-secondary to-secondary/70'
  },
  {
    icon: <SparklesIcon />,
    title: 'Quality',
    desc: 'Beautiful design and smooth experience in every detail. Built with care and precision.',
    color: 'from-accent to-accent/70'
  },
  {
    icon: <HeartIcon />,
    title: 'Community',
    desc: 'Bringing families together across distances and generations. Because connections matter.',
    color: 'from-primary to-secondary'
  }
];

// Stats data
const stats = [
  { value: '10,000+', label: 'Families Served', sublabel: 'And growing every day' },
  { value: '500,000+', label: 'Members Preserved', sublabel: 'Stories kept alive' },
  { value: '50+', label: 'Countries', sublabel: 'Worldwide reach' },
  { value: '2026', label: 'Founded', sublabel: 'Built for the future' }
];

export default function About() {
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
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
              About Us
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Preserving Your{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Family Legacy
              </span>{' '}
              for Generations
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              We're on a mission to make family history accessible, engaging, and beautiful 
              for everyone — because knowing your roots helps you understand where you're going.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-bold text-gray-900">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Story Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Mission */}
            <motion.div
              className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white mb-6">
                <HeartIcon />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                FamilyTree was created to help people preserve and share their family history in a 
                beautiful, interactive way. We believe everyone deserves to know their roots and 
                celebrate their heritage.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                In a world where families are spread across continents, we provide a digital home 
                for your family's stories, photos, and connections — ensuring they're never lost 
                to time or distance.
              </p>
            </motion.div>

            {/* Story */}
            <motion.div
              className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center text-white mb-6">
                <SparklesIcon />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Story</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                What started as a simple project to map one family's genealogy has grown into a 
                platform used by thousands of families worldwide. We're passionate about making 
                family history accessible, engaging, and easy to explore.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Founded in 2026, we've built every feature with real families in mind — from 
                grandparents adding their first photo to tech-savvy users exporting complex 
                family data.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
              Built on{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Core Values
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                <p className="text-gray-700 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div
            className="bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl p-12 lg:p-20 text-center text-white relative overflow-hidden max-w-5xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MailIcon />
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
                Have Questions or Suggestions?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                We'd love to hear from you! Whether you need help, have feedback, or just want 
                to share your family story, we're here to listen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/contact" 
                  className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-primary rounded-xl text-lg font-bold hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  Contact Us
                  <ArrowRightIcon />
                </Link>
                <Link 
                  to="/faq" 
                  className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded-xl text-lg font-bold hover:bg-white/30 transition-all"
                >
                  View FAQ
                </Link>
              </div>
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
              <Link to="/privacy" className="hover:text-primary transition">Privacy</Link>
              <Link to="/terms" className="hover:text-primary transition">Terms</Link>
              <Link to="/contact" className="hover:text-primary transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}