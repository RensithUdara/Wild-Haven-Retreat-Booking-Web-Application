import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Tent, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z.string().trim().max(30).optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const next = searchParams.get("next") || "/account";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) navigate(next, { replace: true });
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(next, { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = isLogin
      ? loginSchema.safeParse({ email, password })
      : signUpSchema.safeParse({ email, password, fullName, phone });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message === "Invalid login credentials"
              ? "Invalid email or password. Please try again."
              : error.message,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: fullName.trim(), phone: phone.trim() },
          },
        });
        if (error) {
          if (error.message.includes("already registered") || error.message.includes("already been registered")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please log in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Check Your Email",
            description: "We've sent you a confirmation link. Verify your email to access your bookings.",
          });
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-foreground flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Tent className="h-5 w-5 text-primary" />
            <span className="text-sm font-normal tracking-wide text-background">
              Wild Haven
            </span>
          </div>
          <h1 className="text-2xl font-light text-background mb-2 tracking-tight">
            {isLogin ? "Welcome Back" : "Create Your Account"}
          </h1>
          <p className="text-xs text-background/60 font-light">
            {isLogin
              ? "Sign in to view and manage your stays"
              : "Sign up to book and track your escapes"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[11px] uppercase tracking-wider font-normal text-background/70">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/30 focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[11px] uppercase tracking-wider font-normal text-background/70">
                  Phone <span className="normal-case tracking-normal text-background/40">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/30 focus-visible:ring-primary"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[11px] uppercase tracking-wider font-normal text-background/70">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-background/10 border-background/20 text-background placeholder:text-background/30 focus-visible:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[11px] uppercase tracking-wider font-normal text-background/70">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-background/10 border-background/20 text-background placeholder:text-background/30 focus-visible:ring-primary"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full text-[11px] uppercase tracking-wider font-normal"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-background/50 hover:text-background/80 font-light transition-colors"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-xs text-background/40 hover:text-background/60 font-light transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to site
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
