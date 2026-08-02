import {
  ArrowRight,
  CalendarDays,
  Facebook,
  Instagram,
  Leaf,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Tent,
  Twitter,
} from "lucide-react";
import { Link } from "react-router-dom";

const exploreLinks = [
  { label: "Locations", to: "/locations" },
  { label: "About Wild Haven", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Bookings", to: "/account" },
];

const stayLinks = [
  { label: "Forest Haven", to: "/location/forest" },
  { label: "Lakeside Retreat", to: "/location/lake" },
  { label: "Meadow Vista", to: "/location/meadow" },
  { label: "Reserve a Stay", href: "/#booking" },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/", icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/", icon: Facebook },
  { label: "Twitter", href: "https://www.twitter.com/", icon: Twitter },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid gap-12 py-16 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="flex flex-col justify-between gap-10">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 smooth-hover hover:opacity-75">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-background/20 bg-background/10">
                  <Tent className="h-4 w-4" />
                </span>
                <span className="text-sm font-normal tracking-wide">Wild Haven</span>
              </Link>

              <p className="mt-6 max-w-xl text-2xl font-light leading-tight text-background sm:text-3xl">
                Quiet cabins, solar light, open skies, and enough stillness to hear yourself think.
              </p>

              <div className="mt-8 grid gap-3 text-xs font-light text-background/70 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <Leaf className="mt-0.5 h-4 w-4 text-primary" />
                  <span>Low-impact stays built around natural rhythms.</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <span>Private retreats prepared before every arrival.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                  <span>Flexible booking for slow weekends and longer resets.</span>
                </div>
              </div>
            </div>

            <a
              href="/#booking"
              className="group inline-flex w-fit items-center gap-3 rounded-full bg-background px-5 py-3 text-xs font-normal uppercase tracking-wider text-foreground smooth-hover hover:bg-primary hover:text-primary-foreground"
            >
              Plan Your Escape
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="text-[11px] font-normal uppercase tracking-wider text-background/50">
                Explore
              </h2>
              <nav className="mt-5 flex flex-col gap-3" aria-label="Footer explore links">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-sm font-light text-background/75 smooth-hover hover:text-background"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h2 className="text-[11px] font-normal uppercase tracking-wider text-background/50">
                Stays
              </h2>
              <nav className="mt-5 flex flex-col gap-3" aria-label="Footer stay links">
                {stayLinks.map((link) =>
                  "to" in link ? (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="text-sm font-light text-background/75 smooth-hover hover:text-background"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm font-light text-background/75 smooth-hover hover:text-background"
                    >
                      {link.label}
                    </a>
                  ),
                )}
              </nav>
            </div>

            <div className="sm:col-span-2">
              <h2 className="text-[11px] font-normal uppercase tracking-wider text-background/50">
                Guest Desk
              </h2>
              <div className="mt-5 grid gap-4 text-sm font-light text-background/75 md:grid-cols-3">
                <a
                  href="mailto:hello@wildhaven.com"
                  className="flex items-center gap-3 smooth-hover hover:text-background"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  hello@wildhaven.com
                </a>
                <a
                  href="tel:+15550140188"
                  className="flex items-center gap-3 smooth-hover hover:text-background"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  +1 (555) 014-0188
                </a>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  Blue Ridge foothills
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-background/15 py-8 text-xs font-light text-background/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Wild Haven. All rights reserved.</p>

          <div className="flex items-center gap-4">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-background/15 text-background/70 smooth-hover hover:border-background/35 hover:bg-background/10 hover:text-background"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
