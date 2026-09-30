import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BentoFeatures from "@/components/BentoFeatures";
import Services from "@/components/Services";
import ThreeGlobe from "@/components/ThreeGlobe";
import Testimonials from "@/components/Testimonials";
import TrustedBy from "@/components/TrustedBy";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import FloatingActions from "@/components/FloatingActions";

const Home = () => {

  return (
    <>
      <Header />
      <PageTransition>
          <div className="min-h-screen bg-background">
            <Hero />
              <BentoFeatures />
              <TrustedBy />
              <Services />
              <ThreeGlobe />
              <Testimonials />
              <Contact />
              <Footer />
          </div>

      </PageTransition>
      <FloatingActions />
    </>
  );

};

export default Home;
