import Header from "@/components/Header";
import Support from "@/components/Support";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import FloatingActions from "@/components/FloatingActions";

const SupportPage = () => {
  return (
    <>
      <Header />
      <PageTransition>
          <div className="min-h-screen bg-background pt-20 sm:pt-24">
          <Support />
          <Contact />
          <Footer />
        </div>
      </PageTransition>
      <FloatingActions />
    </>
  );
};

export default SupportPage;
