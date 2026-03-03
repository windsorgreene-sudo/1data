import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { 
  MessageCircle, 
  Mail, 
  Clock, 
  Send,
  Headphones,
  FileText,
  Zap
} from "lucide-react";
import PageTransition from "@/components/PageTransition";

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message must be less than 5000 characters"),
});

import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import { motion } from "framer-motion";

const ContactPage = () => {
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const rawData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const validatedData = contactSchema.parse(rawData);
      
      const { error: dbError } = await supabase
        .from("contact_submissions")
        .insert({
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message,
        });

      if (dbError) throw dbError;

      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          ...validatedData,
          timestamp: new Date().toISOString(),
        },
      });

      if (emailError) {
        console.error("Email send error:", emailError);
      }

      toast({
        title: "Message Sent Successfully! ✅",
        description: "Thank you for contacting us. We will get back to you within 24 hours.",
      });
      
      e.currentTarget.reset();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "WhatsApp Support",
      description: "Get real-time assistance via WhatsApp",
      value: "+1 (778) 851-7393",
      action: () => window.open("https://wa.me/17788517393", "_blank"),
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      value: "supportbeam@gmail.com",
      action: () => window.open("mailto:supportbeam@gmail.com", "_blank"),
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: Headphones,
      title: "Live Chat",
      description: "Chat with our support team",
      value: "Available 24/7",
      action: () => {},
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  const supportOptions = [
    {
      icon: Zap,
      title: "Quick Start Guides",
      description: "Get up and running in minutes with our comprehensive documentation."
    },
    {
      icon: FileText,
      title: "Knowledge Base",
      description: "Browse our extensive library of tutorials and troubleshooting guides."
    },
    {
      icon: Clock,
      title: "Response Time",
      description: "We aim to respond to all inquiries within 2 hours during business hours."
    }
  ];

    return (
      <>
        <Header />
        <PageTransition>
            <div className="min-h-screen bg-background pt-20 sm:pt-24 overflow-x-hidden">
            {/* Hero Section */}
              <ScrollAnimationWrapper direction="fade">
                <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
                <div className="absolute top-20 right-20 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                  <div className="max-w-3xl mx-auto text-center">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6"
                    >
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      <span className="text-xs sm:text-sm font-medium text-primary">Contact Us</span>
                    </motion.div>
                    <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight tracking-tight">
                      <span className="gradient-text-animated">
                        Get in Touch
                      </span>
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2">
                      Have questions? We would love to hear from you. Send us a message and 
                      we will respond as soon as possible.
                    </p>
                  </div>
                </div>
              </section>
            </ScrollAnimationWrapper>

            {/* Contact Methods */}
            <ScrollAnimationWrapper direction="up">
              <section className="py-8 sm:py-12 border-y border-border/50 bg-card/30">
                <div className="container mx-auto px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
                    {contactMethods.map((method, index) => (
                      <Card 
                        key={index}
                        className="border-border/50 hover:border-primary/40 transition-all duration-300 cursor-pointer group hover:shadow-2xl hover:shadow-primary/5"
                        onClick={method.action}
                      >
                        <CardContent className="p-4 sm:p-6 text-center">
                          <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl ${method.bg} flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-500`}>
                            <method.icon className={`w-5 h-5 sm:w-7 sm:h-7 ${method.color}`} />
                          </div>
                          <h3 className="font-bold text-base sm:text-lg mb-1">{method.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">{method.description}</p>
                          <p className="font-semibold text-primary text-sm sm:text-base">{method.value}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            </ScrollAnimationWrapper>

              {/* Main Contact Section */}
              <section className="py-10 sm:py-16 md:py-20">
                <div className="container mx-auto px-4 sm:px-6">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 max-w-6xl mx-auto">
                  {/* Contact Form */}
                  <ScrollAnimationWrapper direction="left">
                    <Card className="border-primary/20 hover:border-primary/40 transition-all duration-500 shadow-2xl shadow-primary/5">
                      <CardHeader className="p-4 sm:p-6 md:p-8 pb-0">
                        <CardTitle className="text-xl sm:text-2xl md:text-3xl flex items-center gap-2 sm:gap-3">
                          <Send className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary" />
                          Send us a Message
                        </CardTitle>
                        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                          Fill out the form below and we will get back to you shortly.
                        </p>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <label className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 block uppercase tracking-wider opacity-70">First Name *</label>
                              <Input 
                                name="firstName" 
                                placeholder="John" 
                                required 
                                className="h-10 sm:h-12 bg-background/50 hover:border-primary/50 transition-colors rounded-lg sm:rounded-xl text-sm sm:text-base" 
                              />
                            </div>
                            <div>
                              <label className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 block uppercase tracking-wider opacity-70">Last Name *</label>
                              <Input 
                                name="lastName" 
                                placeholder="Doe" 
                                required 
                                className="h-10 sm:h-12 bg-background/50 hover:border-primary/50 transition-colors rounded-lg sm:rounded-xl text-sm sm:text-base" 
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 block uppercase tracking-wider opacity-70">Email Address *</label>
                            <Input 
                              name="email" 
                              type="email" 
                              placeholder="john@example.com" 
                              required 
                              className="h-10 sm:h-12 bg-background/50 hover:border-primary/50 transition-colors rounded-lg sm:rounded-xl text-sm sm:text-base" 
                            />
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 block uppercase tracking-wider opacity-70">Subject *</label>
                            <Input 
                              name="subject" 
                              placeholder="How can we help you?" 
                              required 
                              className="h-10 sm:h-12 bg-background/50 hover:border-primary/50 transition-colors rounded-lg sm:rounded-xl text-sm sm:text-base" 
                            />
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 block uppercase tracking-wider opacity-70">Message *</label>
                            <Textarea 
                              name="message"
                              placeholder="Tell us about your requirements..." 
                              className="min-h-[120px] sm:min-h-[160px] bg-background/50 hover:border-primary/50 transition-colors rounded-lg sm:rounded-xl resize-none text-sm sm:text-base"
                              required
                            />
                          </div>
                            <Button 
                              type="submit"
                              size="lg"
                              variant="premium"
                              className="w-full"
                            >
                            <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Send Message
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </ScrollAnimationWrapper>

                  {/* Support Info */}
                  <div className="space-y-4 sm:space-y-6">

                    {/* Business Hours */}
                    <Card className="border-border/50">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          Business Hours
                        </h3>
                        <div className="space-y-2 text-muted-foreground text-sm sm:text-base">
                          <div className="flex justify-between">
                            <span>Monday - Friday</span>
                            <span className="font-medium text-foreground">9:00 AM - 6:00 PM PST</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Saturday</span>
                            <span className="font-medium text-foreground">10:00 AM - 4:00 PM PST</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sunday</span>
                            <span className="font-medium text-foreground">Closed</span>
                          </div>
                          <p className="text-xs sm:text-sm pt-2 border-t border-border/50 mt-3">
                            * Technical support available 24/7
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Support Options */}
                    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Self-Service Resources</h3>
                        <div className="space-y-3 sm:space-y-4">
                          {supportOptions.map((option, index) => (
                            <div key={index} className="flex items-start gap-2.5 sm:gap-3">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <option.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm sm:text-base">{option.title}</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">{option.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ CTA */}
            <section className="py-10 sm:py-16 bg-gradient-to-r from-primary/10 via-background to-accent/10 border-t border-border/50">
              <div className="container mx-auto px-4 sm:px-6 text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                  Still have questions?
                </h2>
                <p className="text-muted-foreground mb-4 sm:mb-6 max-w-xl mx-auto text-sm sm:text-base">
                  Check out our frequently asked questions or reach out to our support team.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button variant="outline" size="lg">
                    <FileText className="w-4 h-4 mr-2" />
                    View FAQ
                  </Button>
                  <Button 
                    size="lg" 
                    className="bg-gradient-primary hover:shadow-glow transition-all"
                    onClick={() => window.open("https://wa.me/17788517393", "_blank")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with Us
                  </Button>
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

export default ContactPage;
