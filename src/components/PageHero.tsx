import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface PageHeroStat {
  value: string;
  label: string;
}

interface PageHeroProps {
  image: string;
  eyebrow: string;
  title: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
  stats?: PageHeroStat[];
  children?: ReactNode;
}

const PageHero = ({ image, eyebrow, title, description, cta, stats, children }: PageHeroProps) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);

  const isHashLink = cta?.href.startsWith("#");

  return (
    <section className="relative min-h-[82vh] overflow-hidden bg-foreground text-background">
      <motion.img
        src={image}
        alt=""
        aria-hidden="true"
        style={{ y }}
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1 }}
        className="absolute inset-0 h-[115%] w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 flex min-h-[82vh] items-end px-6 pb-20 pt-32 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="grid w-full gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end"
        >
          <div className="max-w-4xl">
            <span className="mb-5 block text-[11px] font-normal uppercase tracking-wider text-background/60">
              {eyebrow}
            </span>
            <h1 className="max-w-4xl text-5xl font-light leading-[1.02] tracking-tight md:text-7xl">
              {title}
            </h1>
            {description && (
              <p className="mt-7 max-w-2xl text-sm font-light leading-7 text-background/72 md:text-base">
                {description}
              </p>
            )}
            {cta &&
              (isHashLink ? (
                <a
                  href={cta.href}
                  className="mt-9 inline-flex items-center gap-3 rounded-full bg-background px-6 py-3 text-xs font-normal uppercase tracking-wider text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {cta.label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  to={cta.href}
                  className="mt-9 inline-flex items-center gap-3 rounded-full bg-background px-6 py-3 text-xs font-normal uppercase tracking-wider text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            {children && <div className="mt-7">{children}</div>}
          </div>

          {stats && stats.length > 0 && (
            <div className="grid overflow-hidden rounded-lg border border-background/15 bg-background/[0.08] backdrop-blur sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-b border-background/15 px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
                >
                  <p className="text-3xl font-light tracking-tight">{stat.value}</p>
                  <p className="mt-2 text-[10px] font-normal uppercase tracking-wider text-background/45">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
