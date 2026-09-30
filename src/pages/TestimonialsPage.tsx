import Header from "@/components/Header";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import FloatingActions from "@/components/FloatingActions";

const TestimonialsPage = () => {
  return (
    <>
      <Header />
      <PageTransition>
          <div className="min-h-screen bg-background pt-20 sm:pt-24">
          <Testimonials />
          <Footer />
        </div>
      </PageTransition>
      <FloatingActions />
    </>
  );
};

export default TestimonialsPage;
