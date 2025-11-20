import Header from '@/components/ui/Header';
import Hero from '@/components/ui/Hero';
import FeatureCards from '@/components/ui/FeatureCards';
import WorkflowSection from '@/components/ui/WorkflowSection';
import TestimonialSection from '@/components/ui/TestimonialSection';
import CTASection from '@/components/ui/CTASection';
import Footer from '@/components/ui/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <FeatureCards />
      <WorkflowSection />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </div>
  );
}