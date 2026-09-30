import { usePageMeta } from "@/hooks/usePageMeta";
import { HomeHero } from "@/components/home/HomeHero";
import { ConsoleShowcase } from "@/components/home/ConsoleShowcase";
import { StackMarquee } from "@/components/home/StackMarquee";
import { Fleet } from "@/components/home/Fleet";
import { Manifesto } from "@/components/home/Manifesto";
import { UnderTheHood } from "@/components/home/UnderTheHood";
import { NetworkPreview } from "@/components/home/NetworkPreview";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PricingPreview } from "@/components/home/PricingPreview";
import { ReviewsStrip } from "@/components/home/ReviewsStrip";
import { CTABand } from "@/components/site/CTABand";

const Home = () => {
  usePageMeta(
    "Beam Server | Cloud VPS and Windows RDP in 25 locations",
    "NVMe VPS and Windows RDP from $9 a month across 25 locations. Full root access, IPv4 and IPv6, a 99.9% uptime SLA and people who answer on WhatsApp.",
  );
  return (
    <>
      <HomeHero />
      <ConsoleShowcase />
      <StackMarquee />
      <Fleet />
      <Manifesto />
      <UnderTheHood />
      <NetworkPreview />
      <HowItWorks />
      <PricingPreview />
      <ReviewsStrip />
      <CTABand />
    </>
  );
};

export default Home;
