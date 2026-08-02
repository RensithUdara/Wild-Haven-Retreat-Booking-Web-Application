import { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import bannerImage from "@/assets/detail-meadow-1.jpg";
import lakeImage from "@/assets/detail-lake-1.jpg";

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@wildhaven.com",
    href: "mailto:hello@wildhaven.com",
  },
  {
    icon: Phone,
    label: "Guest desk",
    value: "+1 (555) 014-0188",
    href: "tel:+15550140188",
  },
  {
    icon: MapPin,
    label: "Basecamp",
    value: "Blue Ridge foothills",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Message sent",
      description: "We'll get back to you as soon as possible.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navigation />

      <main>
        <PageHero
          image={bannerImage}
          eyebrow="Contact"
          title="Tell us what kind of quiet you are looking for."
          description="Ask about availability, accessibility, weather windows, group stays, or the small details that make arriving off-grid feel easy."
          cta={{ label: "Send a note", href: "#contact-form" }}
          stats={[
            { value: "24h", label: "Typical reply" },
            { value: "6", label: "Retreats" },
            { value: "9-5", label: "Weekdays" },
          ]}
        />

        <section id="contact-form" className="py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                const content = (
                  <Card className="h-full rounded-lg border border-border bg-card p-6 shadow-soft smooth-hover hover:-translate-y-1 hover:shadow-hover">
                    <Icon className="mb-6 h-5 w-5 text-primary" />
                    <p className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                      {method.label}
                    </p>
                    <p className="mt-2 text-sm font-light text-foreground">{method.value}</p>
                  </Card>
                );

                return method.href ? (
                  <a key={method.label} href={method.href}>
                    {content}
                  </a>
                ) : (
                  <div key={method.label}>{content}</div>
                );
              })}
            </div>
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65 }}
                className="overflow-hidden rounded-lg border border-border bg-card shadow-hover"
              >
                <div className="relative min-h-[360px]">
                  <img src={lakeImage} alt="Lakeside Wild Haven retreat" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-[11px] font-normal uppercase tracking-wider text-white/60">Before you arrive</p>
                    <h2 className="mt-3 text-3xl font-light leading-tight tracking-tight">
                      We help you choose the stay that fits the season.
                    </h2>
                  </div>
                </div>
                <div className="grid gap-px bg-border sm:grid-cols-2">
                  <div className="bg-card p-6">
                    <p className="text-[11px] font-normal uppercase tracking-wider text-muted-foreground">Best for</p>
                    <p className="mt-2 text-sm font-light text-foreground">Booking questions, special requests, and trip planning.</p>
                  </div>
                  <div className="bg-card p-6">
                    <p className="text-[11px] font-normal uppercase tracking-wider text-muted-foreground">Office hours</p>
                    <p className="mt-2 text-sm font-light text-foreground">Monday to Friday, 9am to 5pm.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.08 }}
              >
                <Card className="rounded-lg border border-border bg-card p-6 shadow-hover md:p-8 lg:p-10">
                  <div className="mb-8">
                    <span className="text-[11px] font-normal uppercase tracking-wider text-muted-foreground">
                      Send a note
                    </span>
                    <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground md:text-4xl">
                      We will point you toward the right retreat.
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-background p-5">
                      <Label htmlFor="name" className="mb-3 flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-wider text-card-foreground">
                        <User className="h-3 w-3" />
                        Name
                      </Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} required maxLength={100} className="h-12 rounded-md bg-card text-sm font-light" />
                    </div>

                    <div className="rounded-lg border border-border bg-background p-5">
                      <Label htmlFor="email" className="mb-3 flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-wider text-card-foreground">
                        <Mail className="h-3 w-3" />
                        Email
                      </Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required maxLength={255} className="h-12 rounded-md bg-card text-sm font-light" />
                    </div>

                    <div className="rounded-lg border border-border bg-background p-5 md:col-span-2">
                      <Label htmlFor="subject" className="mb-3 flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-wider text-card-foreground">
                        <MessageSquare className="h-3 w-3" />
                        Subject
                      </Label>
                      <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required maxLength={200} className="h-12 rounded-md bg-card text-sm font-light" />
                    </div>

                    <div className="rounded-lg border border-border bg-background p-5 md:col-span-2">
                      <Label htmlFor="message" className="mb-3 flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-wider text-card-foreground">
                        <FileText className="h-3 w-3" />
                        Message
                      </Label>
                      <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required maxLength={1000} rows={7} className="resize-none rounded-md bg-card text-sm font-light" />
                    </div>

                    <div className="md:col-span-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 rounded-full bg-foreground px-7 text-[11px] font-normal uppercase tracking-wider text-background hover:bg-primary hover:text-primary-foreground"
                      >
                        {isSubmitting ? "Sending..." : "Send message"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
