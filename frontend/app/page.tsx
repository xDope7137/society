import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import PreviewSection from "@/components/landing/PreviewSection";
import DemoSection from "@/components/landing/DemoSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-green-500/30">
      <Navbar />
      <HeroSection />
      <PreviewSection />
      <DemoSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
