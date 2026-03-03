import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface UserDetails {
  name: string;
  phone: string;
  email: string;
}

interface ChatBotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChatBot = ({ open, onOpenChange }: ChatBotProps) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const botResponses = [
    "Thank you for your message! For immediate assistance, please contact us at +1 (778) 851-7393 or supportbeam@gmail.com",
    "I'd be happy to help! For technical support, our team is available 24/7 at supportbeam@gmail.com",
    "Great question! Our support team can provide detailed assistance via WhatsApp at +1 (778) 851-7393",
    "For account-related queries, please reach out to supportbeam@gmail.com and we'll get back to you within 2 hours!",
    "Our expert team is here to help! Contact us directly for personalized assistance."
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponses[Math.floor(Math.random() * botResponses.length)],
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) return;
    
    setUserDetails(formData);
    
    // Initialize welcome message with user's name
    const welcomeMessage: Message = {
      id: "1",
      content: `Hello ${formData.name}! I'm your Beam support assistant. How can I help you today?`,
      isBot: true,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md h-[85vh] sm:h-[500px] flex flex-col mx-2 sm:mx-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Beam Support Chat
          </DialogTitle>
        </DialogHeader>
        
        {!userDetails ? (
          // User Details Form
          <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col gap-3 sm:gap-4 p-2 sm:p-4">
            <div className="text-center mb-2 sm:mb-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Please fill in your details to start chatting with our support team
              </p>
            </div>
            
            <div className="space-y-3 sm:space-y-4 flex-1">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 block">Phone Number</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  required
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 block">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                  required
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 h-10 sm:h-11 text-sm sm:text-base"
              disabled={!formData.name || !formData.phone || !formData.email}
            >
              Start Chat
            </Button>
          </form>
        ) : (
          // Chat Interface
          <>
            <ScrollArea className="flex-1 p-3 sm:p-4 border rounded-lg">
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    {message.isBot && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-2.5 sm:p-3 rounded-lg ${
                        message.isBot
                          ? 'bg-muted text-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <p className="text-xs sm:text-sm">{message.content}</p>
                    </div>
                    {!message.isBot && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2 pt-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 h-9 sm:h-10 text-sm"
              />
              <Button onClick={handleSendMessage} size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatBot;