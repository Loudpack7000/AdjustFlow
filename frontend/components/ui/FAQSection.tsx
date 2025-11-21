'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'How does AdjustFlow compare to Job Nimbus?',
    answer: 'AdjustFlow offers similar project management capabilities with enhanced CRM features, better document organization, and more flexible customization options. Our platform is designed to be more intuitive while providing powerful tools for managing projects, clients, and communications all in one place.',
  },
  {
    question: 'Can I import my existing data?',
    answer: 'Yes! AdjustFlow supports data import from CSV files and common formats. Our team can also help with bulk imports and data migration from other platforms. Contact our support team for assistance with large data imports.',
  },
  {
    question: 'Is there a mobile app?',
    answer: 'AdjustFlow is fully responsive and works seamlessly on mobile browsers. We\'re currently developing native mobile apps for iOS and Android, which will be available soon. The web version is optimized for mobile use in the meantime.',
  },
  {
    question: 'How secure is my data?',
    answer: 'Security is our top priority. AdjustFlow uses enterprise-grade encryption, regular security audits, and complies with SOC 2 standards. All data is backed up regularly and stored in secure, compliant data centers.',
  },
  {
    question: 'Can I customize fields and workflows?',
    answer: 'Absolutely! AdjustFlow is designed to be flexible and adaptable. You can create custom fields, configure workflows, set up automation rules, and tailor the platform to match your specific business processes.',
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'We offer 24/7 email support, comprehensive documentation, video tutorials, and live chat during business hours. Enterprise plans include dedicated account managers and priority support.',
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required. You can explore all capabilities and see if AdjustFlow is the right fit for your business.',
  },
  {
    question: 'Can multiple team members use AdjustFlow?',
    answer: 'Yes, AdjustFlow is built for teams. You can invite team members, assign roles and permissions, collaborate on projects, and track team activity. Pricing scales based on the number of users.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Frequently Asked <span className="text-blue-600">Questions</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about AdjustFlow. Can't find what you're looking for? 
            <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium ml-1 transition-colors">
              Contact our support team
            </a>.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="text-base sm:text-lg font-semibold text-slate-900 pr-8">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0 transition-transform" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 transition-transform" />
                  )}
                </button>
                
                {isOpen && (
                  <div id={`faq-answer-${index}`} className="px-6 pb-5 pt-0">
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}

