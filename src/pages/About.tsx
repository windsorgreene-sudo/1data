import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Globe, 
  Shield, 
  Zap, 
  Award,
  Building2,
  Rocket,
  CheckCircle2
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Zap,
      title: "Performance First",
      description: "We obsess over every millisecond. Our infrastructure is optimized for speed, ensuring your applications run at peak performance."
    },
    {
      icon: Shield,
      title: "Security Always",
      description: "Enterprise-grade security is built into everything we do. Your data and applications are protected by industry-leading protocols."
    },
    {
      icon: Heart,
      title: "Customer Obsessed",
      description: "Your success is our success. We provide 24/7 support and go above and beyond to ensure you achieve your goals."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "With data centers worldwide, we bring your applications closer to your users, reducing latency and improving experience."
    }
  ];

  const stats = [
    { value: "99.99%", label: "Uptime SLA" },
    { value: "50+", label: "Global Locations" },
    { value: "10K+", label: "Happy Customers" },
    { value: "24/7", label: "Expert Support" }
  ];

  const milestones = [
    { year: "2024", title: "Founded", description: "Beam Server was established with a mission to provide reliable cloud infrastructure." },
    { year: "2025", title: "Expansion", description: "Expanded services and launched additional datacenters worldwide." },
    { year: "2026", title: "Next Chapter", description: "Continuing to grow and innovate for our customers." }
  ];

  return (
    <>
      <Header />
      <PageTransition>
          <div className="min-h-screen bg-background pt-20 sm:pt-24 overflow-x-hidden">
          {/* Hero Section */}
          <section
            className="relative py-12 sm:py-16 md:py-20 overflow-hidden"
          >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
              <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              
              <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6"
                    >
                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-xs sm:text-sm font-medium text-primary">About Beam Server</span>
                  </motion.div>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight tracking-tight">
                    <span className="gradient-text-animated">
                      Powering the Future
                    </span>
                    <br />
                    <span className="text-foreground">of Cloud Infrastructure</span>
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 leading-relaxed px-2">
                    We are on a mission to make high-performance cloud infrastructure accessible to everyone. 
                    From startups to enterprises, we provide the tools you need to build, scale, and succeed.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                    <Button 
                      size="lg" 
                      variant="premium"
                      className="shadow-xl text-sm sm:text-base"
                      onClick={() => navigate('/pricing')}
                    >
                      View Our Plans
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-glass-hover bg-glass/20 backdrop-blur-md text-sm sm:text-base"
                      onClick={() => navigate('/contact')}
                    >
                      Get in Touch
                    </Button>
                  </div>
                </div>
              </div>
          </section>

            {/* Stats Section */}
          <ScrollAnimationWrapper direction="up">
            <section className="py-10 sm:py-12 md:py-16 bg-card/50 border-y border-border/50">
              <div className="container mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                  {stats.map((stat, index) => (
                    <motion.div 
                      key={index} 
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-text-gradient bg-clip-text text-transparent mb-1 sm:mb-2">
                        {stat.value}
                      </p>
                      <p className="text-muted-foreground font-medium uppercase tracking-wider text-[10px] sm:text-xs lg:text-sm">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </ScrollAnimationWrapper>

          {/* Mission & Vision */}
          <ScrollAnimationWrapper direction="up">
            <section className="py-12 sm:py-16 md:py-20 lg:py-28">
              <div className="container mx-auto px-4 sm:px-6">
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-6xl mx-auto">
                  <Card className="border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 group">
                    <CardContent className="p-5 sm:p-6 md:p-8 lg:p-12">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500">
                        <Target className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Our Mission</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base lg:text-lg">
                        To democratize cloud infrastructure by providing enterprise-grade hosting solutions 
                        that are accessible, affordable, and incredibly powerful. We believe every developer 
                        and business deserves access to world-class infrastructure without complexity or 
                        prohibitive costs.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 group">
                    <CardContent className="p-5 sm:p-6 md:p-8 lg:p-12">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-accent/10 flex items-center justify-center mb-4 sm:mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500">
                        <Eye className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-accent" />
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Our Vision</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base lg:text-lg">
                        To become the most trusted cloud infrastructure partner for businesses worldwide. 
                        We envision a future where deploying and scaling applications is as simple as a 
                        single click, powered by sustainable technology and backed by unwavering support.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </ScrollAnimationWrapper>

          {/* Values Section */}
          <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-b from-card/30 to-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-10 sm:mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                  <span className="bg-text-gradient bg-clip-text text-transparent">Our Core Values</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
                  These principles guide everything we do, from product development to customer support.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
                {values.map((value, index) => (
                  <Card 
                    key={index}
                    className="border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-lg group"
                  >
                    <CardContent className="p-4 sm:p-5 md:p-6 text-center">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                        <value.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{value.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Timeline / Journey */}
          <section className="py-12 sm:py-16 md:py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-10 sm:mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                  <span className="bg-text-gradient bg-clip-text text-transparent">Our Journey</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
                  From a small startup to a global infrastructure provider, here is how we have grown.
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary via-accent to-primary/20" />
                  
                  {milestones.map((milestone, index) => (
                    <div 
                      key={index}
                      className={`relative flex items-center mb-6 sm:mb-8 ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary border-4 border-background shadow-glow z-10" />
                      
                      {/* Content */}
                      <div className={`ml-10 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-8 lg:md:pr-12 md:text-right' : 'md:pl-8 lg:md:pl-12'}`}>
                        <Card className="border-border/50 hover:border-primary/30 transition-all inline-block w-full">
                          <CardContent className="p-4 sm:p-5">
                            <span className="text-primary font-bold text-base sm:text-lg">{milestone.year}</span>
                            <h3 className="font-semibold text-base sm:text-lg mt-1">{milestone.title}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">{milestone.description}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-b from-card/30 to-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                      <span className="bg-text-gradient bg-clip-text text-transparent">
                        Why Choose Beam Server?
                      </span>
                    </h2>
                    <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
                      We combine cutting-edge technology with exceptional support to deliver 
                      an infrastructure experience that just works. Here is what sets us apart:
                    </p>
                    
                    <div className="space-y-3 sm:space-y-4">
{[
                          "NVMe SSD storage for blazing fast I/O performance",
                          "One-click deployments and automated scaling",
                          "99.99% uptime guarantee backed by SLA",
                          "24/7 expert support via chat, email, and phone",
                          "Transparent pricing with no hidden fees"
                        ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 sm:gap-3">
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                          <span className="text-foreground text-sm sm:text-base">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
                      <CardContent className="p-5 sm:p-6 md:p-8 text-center">
                        <Rocket className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-primary mx-auto mb-4 sm:mb-6" />
                        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to Get Started?</h3>
                        <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                          Join our satisfied customers who trust Beam Server for their infrastructure needs.
                        </p>
                        <Button 
                          size="lg" 
                          className="w-full bg-gradient-primary hover:shadow-glow transition-all text-sm sm:text-base"
                          onClick={() => navigate('/pricing')}
                        >
                          View Our Plans
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </PageTransition>
      <FloatingActions />
    </>
  );
};

export default About;
