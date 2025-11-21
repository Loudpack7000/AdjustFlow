import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              About <span className="text-blue-600">AdjustFlow</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We're building the future of project management and CRM software, 
              designed specifically for professionals who need powerful tools that adapt to their industry.
            </p>
          </div>

          {/* Mission Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-slate-600 leading-relaxed mb-4">
                At AdjustFlow, we believe that managing projects and client relationships shouldn't be complicated. 
                Our mission is to provide professionals with intuitive, powerful tools that streamline their workflows 
                and help them build stronger relationships with their clients.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Whether you're a roofing contractor coordinating with insurance adjusters, a restoration company 
                managing emergency responses, or a general contractor overseeing multiple projects, AdjustFlow 
                adapts to your needs.
              </p>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Simplicity</h3>
                <p className="text-slate-600">
                  We believe powerful software should be easy to use. No complex training required—just intuitive 
                  tools that work the way you do.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Flexibility</h3>
                <p className="text-slate-600">
                  Every business is unique. That's why AdjustFlow is designed to be customizable, allowing you 
                  to adapt it to your specific workflows and industry needs.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Reliability</h3>
                <p className="text-slate-600">
                  Your data is critical to your business. We provide enterprise-grade security, regular backups, 
                  and 99.9% uptime to ensure your information is always safe and accessible.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Support</h3>
                <p className="text-slate-600">
                  We're here to help you succeed. From onboarding to ongoing support, our team is committed to 
                  ensuring you get the most out of AdjustFlow.
                </p>
              </div>
            </div>
          </section>

          {/* Story Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-slate-600 leading-relaxed mb-4">
                AdjustFlow was born from a simple observation: professionals in industries like roofing, 
                construction, and insurance adjusting were struggling with disconnected tools and complex 
                software that didn't fit their workflows.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                We set out to create a platform that combines the power of project management with the 
                relationship-building capabilities of a CRM, all while remaining flexible enough to adapt 
                to different industries and business models.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Today, AdjustFlow helps thousands of professionals manage their projects, organize their 
                documents, track their communications, and build stronger relationships with their clients—all 
                in one integrated platform.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-blue-50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Ready to streamline your workflow?
            </h2>
            <p className="text-slate-600 mb-6">
              Join professionals who are managing projects more efficiently with AdjustFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-blue-600 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

