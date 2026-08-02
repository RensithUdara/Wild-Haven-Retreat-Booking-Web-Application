import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Tent,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import authImage from "@/assets/detail-forest-2.jpg";

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate(next, { replace: true });
    });

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
            description:
              error.message === "Invalid login credentials"
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
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-foreground text-background lg:block">
          <img src={authImage} alt="Forest retreat at Wild Haven" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

          <Link to="/" className="absolute left-10 top-8 z-10 flex items-center gap-2">
            <Tent className="h-4 w-4 text-primary" />
            <span className="text-sm font-normal tracking-wide text-background">Wild Haven</span>
          </Link>

          <div className="relative z-10 flex min-h-screen flex-col justify-end p-10 xl:p-14">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75 }}
              className="max-w-2xl"
            >
              <span className="mb-5 block text-[11px] font-normal uppercase tracking-wider text-background/55">
                Guest access
              </span>
              <h1 className="text-5xl font-light leading-[1.04] tracking-tight xl:text-7xl">
                Keep every quiet stay in one place.
              </h1>
              <p className="mt-6 max-w-xl text-sm font-light leading-7 text-background/70">
                Sign in to review reservations, download receipts, manage guest details, and plan the
                next stretch of open sky.
              </p>
            </motion.div>

            <div className="mt-12 grid max-w-2xl grid-cols-3 divide-x divide-background/15 border-y border-background/15">
              <div className="py-5 pr-5">
                <CalendarDays className="mb-3 h-4 w-4 text-primary" />
                <p className="text-[10px] font-normal uppercase tracking-wider text-background/45">Bookings</p>
              </div>
              <div className="px-5 py-5">
                <ShieldCheck className="mb-3 h-4 w-4 text-primary" />
                <p className="text-[10px] font-normal uppercase tracking-wider text-background/45">Receipts</p>
              </div>
              <div className="py-5 pl-5">
                <Tent className="mb-3 h-4 w-4 text-primary" />
                <p className="text-[10px] font-normal uppercase tracking-wider text-background/45">Retreats</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center px-6 py-10 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-full max-w-xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 lg:hidden">
                <Tent className="h-4 w-4 text-primary" />
                <span className="text-sm font-normal tracking-wide text-foreground">Wild Haven</span>
              </Link>
              <button
                onClick={() => navigate("/")}
                className="ml-auto inline-flex items-center gap-2 text-[11px] font-normal uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to site
              </button>
            </div>

            <Card className="overflow-hidden rounded-lg border border-border bg-card shadow-hover">
              <div className="border-b border-border p-6 md:p-8">
                <span className="text-[11px] font-normal uppercase tracking-wider text-muted-foreground">
                  {isLogin ? "Welcome back" : "Create account"}
                </span>
                <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground md:text-4xl">
                  {isLogin ? "Sign in to your stays." : "Start your Wild Haven account."}
                </h2>
                <p className="mt-4 text-sm font-light leading-7 text-muted-foreground">
                  {isLogin
                    ? "View bookings, receipts, guest details, and your next reservation."
                    : "Save your guest details and keep every future retreat easy to manage."}
                </p>
              </div>

              <div className="p-6 md:p-8">
                <div className="mb-6 grid grid-cols-2 rounded-full bg-secondary p-1">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`rounded-full px-4 py-2 text-[11px] font-normal uppercase tracking-wider transition-colors ${
                      isLogin ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`rounded-full px-4 py-2 text-[11px] font-normal uppercase tracking-wider transition-colors ${
                      !isLogin ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign up
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-5">
                  {!isLogin && (
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="rounded-lg border border-border bg-background p-5">
                        <Label htmlFor="fullName" className="mb-3 flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-wider">
                          <User className="h-3 w-3" />
                          Full name
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Smith"
                          className="h-12 bg-card text-sm font-light"
                          required
                        />
                      </div>

                      <div className="rounded-lg border border-border bg-background p-5">
                        <Label htmlFor="phone" className="mb-3 flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-wider">
                          <Phone className="h-3 w-3" />
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 555 014 0188"
                          className="h-12 bg-card text-sm font-light"
                        />
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border border-border bg-background p-5">
                    <Label htmlFor="email" className="mb-3 flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-wider">
                      <Mail className="h-3 w-3" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-12 bg-card text-sm font-light"
                      required
                    />
                  </div>

                  <div className="rounded-lg border border-border bg-background p-5">
                    <Label htmlFor="password" className="mb-3 flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-wider">
                      <LockKeyhole className="h-3 w-3" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="h-12 bg-card text-sm font-light"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 rounded-full bg-foreground text-[11px] font-normal uppercase tracking-wider text-background hover:bg-primary hover:text-primary-foreground"
                  >
                    {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Auth;
