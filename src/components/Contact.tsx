import { MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { motion } from "framer-motion";
import { ParallaxElement } from "./ParallaxBackground";
import { TextReveal, ParagraphReveal } from "./TextReveal";

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message must be less than 5000 characters"),
});

const Contact = () => {
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
  
  return (
    <section id="contact" className="py-12 sm:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 aurora-bg opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-8 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 gradient-text-animated">
              Get in Touch
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to get started? Contact our expert team for personalized support.
            </p>
          </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
            <Card className="frosted-card hover:border-primary/30 transition-all duration-500 hover:shadow-beam h-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium mb-2 block">First Name</label>
                      <Input name="firstName" placeholder="John" required className="hover:border-primary/50 transition-colors duration-300" />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium mb-2 block">Last Name</label>
                      <Input name="lastName" placeholder="Doe" required className="hover:border-primary/50 transition-colors duration-300" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block">Email</label>
                    <Input name="email" type="email" placeholder="john@example.com" required className="hover:border-primary/50 transition-colors duration-300" />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block">Subject</label>
                    <Input name="subject" placeholder="How can we help you?" required className="hover:border-primary/50 transition-colors duration-300" />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block">Message</label>
                    <Textarea 
                      name="message"
                      placeholder="Tell us about your requirements..." 
                      className="min-h-[100px] sm:min-h-[120px] hover:border-primary/50 transition-colors duration-300"
                      required
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-primary hover:shadow-glow md:hover:scale-105 transition-all duration-300 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">Send Message</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <div className="space-y-4 sm:space-y-8 h-full flex flex-col">
              {/* Support Options */}
              <div className="grid gap-4 sm:gap-6 flex-1">
                <Card className="frosted-card hover:border-primary/30 hover:shadow-beam md:hover:scale-105 transition-all duration-300 group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-gradient-primary rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex-shrink-0">
                        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">WhatsApp Support</h3>
                        <p className="text-sm text-muted-foreground mb-2 sm:mb-3">
                          Instant assistance via WhatsApp
                        </p>
                        <p 
                          className="font-medium text-sm sm:text-base hover:text-primary transition-colors duration-300 cursor-pointer truncate"
                          onClick={() => window.open("https://wa.me/17788517393", "_blank")}
                        >
                          +1 (778) 851-7393
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="frosted-card hover:border-primary/30 hover:shadow-beam md:hover:scale-105 transition-all duration-300 group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-gradient-primary rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex-shrink-0">
                        <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">Email Support</h3>
                        <p className="text-sm text-muted-foreground mb-2 sm:mb-3">
                          Get detailed assistance via email
                        </p>
                        <p 
                          className="font-medium text-sm sm:text-base hover:text-primary transition-colors duration-300 cursor-pointer truncate"
                          onClick={() => window.open("mailto:supportbeam@gmail.com", "_blank")}
                        >
                          supportbeam@gmail.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
