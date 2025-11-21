import Header from '@/components/ui/Header';
import Hero from '@/components/ui/Hero';
import WhoWeServe from '@/components/ui/WhoWeServe';
import FeatureCards from '@/components/ui/FeatureCards';
import WorkflowSection from '@/components/ui/WorkflowSection';
import TestimonialSection from '@/components/ui/TestimonialSection';
import FAQSection from '@/components/ui/FAQSection';
import CTASection from '@/components/ui/CTASection';
import Footer from '@/components/ui/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen scroll-smooth">
      <Header />
      <Hero />
      <WhoWeServe />
      <FeatureCards />
      <WorkflowSection />
      <TestimonialSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}