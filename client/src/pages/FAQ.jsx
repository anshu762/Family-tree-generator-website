import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

// FAQ data with categories
const faqCategories = [
  {
    category: 'Getting Started',
    icon: '🚀',
    faqs: [
      {
        q: 'Is FamilyTree free to use?',
        a: 'Yes! FamilyTree offers a free tier that includes unlimited family members and trees. Premium features like advanced export options and priority support may be added in the future.'
      },
      {
        q: 'Do I need any technical knowledge to use FamilyTree?',
        a: 'Not at all! FamilyTree is designed to be intuitive for users of all technical skill levels, from tech-savvy genealogy enthusiasts to grandparents adding their first family photo.'
      },
      {
        q: 'How do I create my first family tree?',
        a: 'Simply sign up for a free account, click "Create New Tree" on your dashboard, name your tree, and start adding family members with our easy-to-use interface.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    icon: '🔒',
    faqs: [
      {
        q: 'How private is my family data?',
        a: 'Your family trees are completely private by default. Only you can view or edit them. We never share your data with third parties.'
      },
      {
        q: 'What happens if I delete my account?',
        a: 'Deleting your account permanently removes all your family trees and data. This action cannot be undone, so please export any important data first.'
      },
      {
        q: 'Is my data encrypted?',
        a: 'Yes, all data transmission is encrypted using HTTPS/SSL. Your password is securely hashed and never stored in plain text.'
      }
    ]
  },
  {
    category: 'Features',
    icon: '✨',
    faqs: [
      {
        q: 'Can I export my family tree?',
        a: 'Yes, you can export your tree as JSON (for backup) or PDF (for printing and sharing). More export formats are planned for future releases.'
      },
      {
        q: 'Can I add photos to family members?',
        a: 'Absolutely! Each family member can have a photo URL, bio, birth/death dates, and more to help preserve their story.'
      },
      {
        q: 'Can I share my family tree with others?',
        a: 'Currently, trees are private. A public share link feature is in development and will be available in a future release.'
      },
      {
        q: 'How many family members can I add?',
        a: 'There is no limit on the free tier! Add as many family members as needed to build your complete family history.'
      }
    ]
  },
  {
    category: 'Account & Billing',
    icon: '💳',
    faqs: [
      {
        q: 'Do you offer premium plans?',
        a: 'Currently, all core features are free. We may introduce premium plans in the future for advanced features like unlimited photo storage or priority support.'
      },
      {
        q: 'Can I change my email address?',
        a: 'Yes, you can update your email address anytime from the Profile Settings page in your account.'
      },
      {
        q: 'How do I reset my password?',
        a: 'You can change your password from the Profile Settings page by providing your current password and setting a new one.'
      }
    ]
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const allCategories = ['All', ...faqCategories.map(c => c.category)];

  const filteredFaqs = faqCategories
    .filter(cat => activeCategory === 'All' || cat.category === activeCategory)
    .map(cat => ({
      ...cat,
      faqs: cat.faqs.filter(
        faq =>
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(cat => cat.faqs.length > 0);

  const totalResults = filteredFaqs.reduce((sum, cat) => sum + cat.faqs.length, 0);

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
              Help Center
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Find answers to common questions about FamilyTree. Can't find what you're looking for? 
              We're happy to help.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-lg"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-8 px-6">
        <div className="container mx-auto">
          <motion.div
            className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pb-24 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            {/* Results Count */}
            {searchQuery && (
              <motion.p
                className="text-gray-600 mb-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Found <strong>{totalResults}</strong> result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
              </motion.p>
            )}

            {/* No Results */}
            {filteredFaqs.length === 0 && (
              <motion.div
                className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try a different search term or browse all categories</p>
              </motion.div>
            )}

            {/* FAQ Categories */}
            <div className="space-y-10">
              {filteredFaqs.map((category, catIndex) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
                  </div>

                  <div className="space-y-3">
                    {category.faqs.map((faq, index) => {
                      const globalIndex = `${category.category}-${index}`;
                      const isOpen = openIndex === globalIndex;

                      return (
                        <motion.div
                          key={globalIndex}
                          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <button
                            className="w-full p-6 text-left flex justify-between items-center gap-4"
                            onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          >
                            <span className="font-semibold text-lg text-gray-900">{faq.q}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                              isOpen ? 'bg-primary text-white rotate-180' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-6 text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                                  {faq.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
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
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ChatIcon />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
                Still Have Questions?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl text-lg font-bold hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                Contact Support
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
              <Link to="/privacy" className="hover:text-primary transition">Privacy</Link>
              <Link to="/contact" className="hover:text-primary transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}