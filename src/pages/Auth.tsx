import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { TideShader } from "@/components/fx/TideShader";
import { Logo } from "@/components/site/Logo";
import { SplitText } from "@/components/motion/SplitText";
import { usePageMeta } from "@/hooks/usePageMeta";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  usePageMeta(isSignUp ? "Create an account" : "Sign in");

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
        
        toast.success("Account created. You can sign in now.");
        setIsSignUp(false);
        setPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success("Welcome back.");
        navigate("/");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else if (message.includes("User already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(message || "Something went wrong");
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
    } catch (error: unknown) {
      toast.error((error instanceof Error && error.message) || "Google sign in failed");
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="grid min-h-[100svh] bg-ink lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:block">
          <TideShader className="absolute inset-0" fadeBottom={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <Link to="/" aria-label="Beam Server home">
              <Logo />
            </Link>
            <div>
              <SplitText
                as="h2"
                trigger="mount"
                text={"Your servers,\n*one login away.*"}
                className="display text-[clamp(3rem,5vw,4.8rem)] font-bold leading-[0.92] text-bone"
              />
              <ul className="mt-10 grid max-w-md gap-3 text-[15px] text-bone/75">
                {["Servers, invoices and tickets in one place", "Real-time notifications for every change", "The same team behind WhatsApp and email"].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="h-px w-4 bg-beam" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-5 py-16 sm:px-10">
          <div className="absolute inset-0 bg-grid opacity-40 mask-radial" aria-hidden />
          <div className="relative w-full max-w-md">
            <Link to="/" className="mb-10 inline-flex lg:hidden" aria-label="Beam Server home">
              <Logo />
            </Link>
            <p className="eyebrow">{isSignUp ? "New account" : "Customer portal"}</p>
            <h1 className="display mt-4 text-[2.8rem] font-bold leading-none tracking-[-0.045em] text-bone">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-3 text-[15px] text-mute">
              {isSignUp ? "Takes under a minute. No card needed to sign up." : "Sign in to manage servers, invoices and tickets."}
            </p>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="btn-smooth mt-10 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.03] text-[15px] text-bone transition-colors hover:border-white/25 hover:bg-white/[0.06] disabled:opacity-60"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="my-8 flex items-center gap-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mute">
              <span className="h-px flex-1 bg-white/10" />
              or with email
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleEmailAuth} className="grid gap-5">
              {isSignUp && (
                <div>
                  <label htmlFor="fullName" className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
                    Full name
                  </label>
                  <input id="fullName" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} className="field" />
                </div>
              )}
              <div>
                <label htmlFor="email" className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
                  Email
                </label>
                <input id="email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required className="field" />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
                  Password
                </label>
                <input id="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} placeholder={isSignUp ? "At least 6 characters" : ""} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required className="field" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-smooth mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-bone text-[15px] font-medium text-ink transition-all duration-500 hover:bg-white hover:shadow-[0_0_0_5px_hsl(var(--bone)/0.1)] disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSignUp ? "Create account" : "Sign in"}
              </button>
            </form>

            <p className="mt-8 text-center text-[14px] text-mute">
              {isSignUp ? "Already have an account?" : "New to Beam?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setPassword("");
                }}
                disabled={loading}
                className="text-beam underline-offset-4 hover:underline"
              >
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </p>

            <Link to="/" className="mt-10 inline-flex items-center gap-2 text-[13px] text-mute transition-colors hover:text-bone">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to the site
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Auth;
