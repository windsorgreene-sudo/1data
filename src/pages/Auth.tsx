import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isSignUp && password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;
        
        toast.success("Account created successfully! You can now sign in.");
        setIsSignUp(false);
        setPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success("Signed in successfully!");
        navigate("/");
      }
    } catch (error: any) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else if (error.message.includes("User already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex relative overflow-hidden bg-background">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-surface">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-primary rounded-full opacity-10 animate-float blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-accent rounded-full opacity-15 animate-float-delayed blur-3xl" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-primary rounded-full opacity-10 animate-breathe blur-2xl" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-gradient-accent rounded-full opacity-8 animate-float blur-xl" style={{animationDelay: '3s'}}></div>
        </div>

        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
        <div className="max-w-lg animate-fade-in">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 mb-12 group">
            <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <span className="text-primary-foreground font-bold text-2xl">B</span>
            </div>
            <span className="text-3xl font-bold bg-text-gradient bg-clip-text text-transparent">
              Beam Server
            </span>
          </Link>

          {/* Main Heading */}
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            <span className="text-foreground">Welcome to the</span>
            <br />
            <span className="bg-text-gradient bg-clip-text text-transparent animate-glow-pulse">
              Future of Cloud
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Experience <span className="text-primary font-semibold">blazing-fast</span> VPS and 
            <span className="text-accent font-semibold"> premium</span> Cloud RDPs with 
            <span className="text-primary font-semibold"> enterprise-grade</span> infrastructure.
          </p>

          {/* Feature Cards */}
          <div className="space-y-4">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Deploy in seconds" },
              { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption" },
              { icon: Sparkles, title: "99.9% Uptime", desc: "Always available" },
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-card/50 backdrop-blur-sm border border-glass group hover:border-primary/50 transition-all duration-500 hover:shadow-glow cursor-default animate-slide-in-left"
                style={{animationDelay: `${0.2 + index * 0.15}s`}}
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center justify-center space-x-3 mb-8 group">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-all duration-500">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold bg-text-gradient bg-clip-text text-transparent">
              Beam Server
            </span>
          </Link>

          {/* Form Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-primary rounded-3xl opacity-20 blur-xl animate-glow-pulse"></div>
            
            <div className="relative bg-gradient-card/95 backdrop-blur-xl rounded-3xl border border-glass p-8 md:p-10 shadow-premium">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-muted-foreground">
                  {isSignUp
                    ? "Start your journey with Beam Server"
                    : "Sign in to access your dashboard"}
                </p>
              </div>

              {/* Google Auth */}
              <Button
                variant="outline"
                className="w-full h-12 border-glass bg-secondary/50 hover:bg-secondary hover:border-primary/50 transition-all duration-500 group mb-6"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <svg className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span className="font-semibold text-foreground">Continue with Google</span>
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-glass" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-card text-sm text-muted-foreground">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailAuth} className="space-y-5">
                {isSignUp && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="fullName" className="text-foreground font-medium">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                        className="pl-12 h-12 bg-secondary/50 border-glass focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                      className="pl-12 h-12 bg-secondary/50 border-glass focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="pl-12 h-12 bg-secondary/50 border-glass focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary text-primary-foreground hover:shadow-glow-shadow hover:scale-[1.02] transition-all duration-500 font-semibold text-lg group relative overflow-hidden"
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="relative flex items-center justify-center gap-2">
                      {isSignUp ? "Create Account" : "Sign In"}
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Toggle */}
              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setPassword("");
                    }}
                    className="ml-2 text-primary font-semibold hover:text-accent transition-colors duration-300 hover:underline underline-offset-4"
                    disabled={loading}
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 inline-flex items-center gap-2 group"
            >
              <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Auth;
