import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquare, Mail, MessageCircle, Clock } from "lucide-react";
import ChatBot from "./ChatBot";
import { motion } from "framer-motion";
import { ParallaxElement } from "./ParallaxBackground";
import { StaggeredGrid } from "./StaggeredGrid";
import { TiltCard } from "./TiltCard";
import { TextReveal, ParagraphReveal } from "./TextReveal";

const Support = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const supportOptions = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Get automated help from our AI chatbot and support team",
      action: "Start Chat",
      available: "24/7 Available"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us detailed questions and we'll respond quickly",
      action: "Send Email",
      available: "Response within 2 hours"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Support",
      description: "Chat with us directly on WhatsApp for quick assistance",
      action: "Chat on WhatsApp",
      available: "Business Hours"
    }
  ];

  const faqs = [
    {
      question: "What makes your Cloud RDP and VPS services stand out?",
      answer: "We offer enterprise-grade infrastructure with 99.9% uptime guarantee, NVMe SSD storage, and premium network connectivity. Our servers are deployed in Tier-4 data centers across multiple continents for optimal performance and reliability."
    },
    {
      question: "How quickly can I deploy a Cloud RDP or VPS?",
      answer: "Once payment is confirmed, your server will be configured and ready within minutes. You'll receive login credentials via email once the setup is complete, typically in under 30 minutes."
    },
    {
      question: "What locations are available for RDP and VPS?",
      answer: "Our global network includes premium data centers in US (multiple regions), UK, Germany, France, Netherlands, Singapore, Japan, Australia, and more. Each location offers low-latency connections and enterprise-grade security."
    },
    {
      question: "Do you offer custom solutions for enterprise clients?",
      answer: "Absolutely! We specialize in tailored solutions including custom RDP configurations, scalable VPS clusters, dedicated resources, priority support, and flexible billing options. Enterprise packages include dedicated account managers and SLA guarantees."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We offer 24/7 premium support through live chat, WhatsApp, and email. Our expert team provides real-time assistance, setup guidance, troubleshooting, and optimization recommendations for all Cloud RDP and VPS services."
    },
    {
      question: "Can I upgrade my RDP or VPS specifications?",
      answer: "Yes! You can easily upgrade resources including RAM, CPU cores, storage, and bandwidth at any time. Upgrades are applied with minimal downtime, and you only pay the difference for the remaining billing period."
    },
    {
      question: "What operating systems are supported?",
      answer: "For VPS, we support all major Linux distributions (Ubuntu, CentOS, Debian, AlmaLinux) and Windows Server editions. Cloud RDP comes pre-configured with Windows Server for immediate use with full administrative access."
    },
    {
      question: "What pricing models do you offer?",
      answer: "We offer flexible monthly subscriptions with no long-term commitments. Volume discounts are available for multiple servers. Contact us for custom quotes and enterprise pricing tailored to your specific requirements."
    }
  ];

  return (
    <section id="support" className="py-12 sm:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 aurora-bg opacity-40" />

      <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-8 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 gradient-text-animated">
              24/7 Support
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Real humans, real solutions. Our expert team is here to help you succeed.
            </p>
          </motion.div>
        
        <StaggeredGrid 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto mb-8 sm:mb-12"
          staggerDelay={0.15}
        >
          {supportOptions.map((option, index) => (
            <TiltCard key={index} className="h-full" tiltAmount={8}>
              <Card 
                className="bg-glass border-border hover:border-primary transition-all duration-500 hover:shadow-premium text-center group h-full"
              >
                <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                    <option.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-base sm:text-xl text-foreground group-hover:text-primary transition-colors duration-300">{option.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  <div className="flex items-center justify-center text-xs sm:text-sm text-primary group-hover:animate-pulse">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {option.available}
                  </div>
                  <Button 
                    className="w-full bg-gradient-primary text-primary-foreground hover:shadow-glow md:hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                    onClick={() => {
                      if (option.title === "WhatsApp Support") {
                        window.open("https://wa.me/17788517393", "_blank");
                      } else if (option.title === "Email Support") {
                        window.open("mailto:supportbeam@gmail.com", "_blank");
                      } else if (option.title === "Live Chat") {
                        setChatOpen(true);
                      }
                    }}
                  >
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            </TiltCard>
          ))}
        </StaggeredGrid>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-center mb-8 sm:mb-12"
          >
            <h3 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3 sm:mb-4">Frequently Asked Questions</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Find quick answers to common questions</p>
          </motion.div>
          
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
              >
                <AccordionItem value={`item-${index}`} className="frosted-card rounded-lg px-4 sm:px-6 hover:border-primary/30 transition-all duration-300">
                  <AccordionTrigger className="text-left font-medium text-sm sm:text-base text-foreground hover:text-primary transition-colors py-3 sm:py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-1 sm:pt-2 pb-3 sm:pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
      
      <ChatBot open={chatOpen} onOpenChange={setChatOpen} />
    </section>
  );
};

export default Support;
