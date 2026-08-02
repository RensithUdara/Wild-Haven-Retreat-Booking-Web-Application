import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Droplets, Leaf, Moon, Sparkles, Sun, WifiOff } from "lucide-react";
import detailLake from "@/assets/detail-lake-2.jpg";
import detailMeadow from "@/assets/detail-meadow-1.jpg";

const features = [
  {
    icon: Leaf,
    title: "100% Off-Grid",
    description: "Solar power, composting systems, and a footprint designed to stay light.",
  },
  {
    icon: WifiOff,
    title: "Digital Detox",
    description: "Signal fades, attention returns, and the day starts feeling spacious again.",
  },
  {
    icon: Droplets,
    title: "Natural Water",
    description: "Fresh spring water and simple eco-friendly facilities are ready on arrival.",
  },
  {
    icon: Sun,
    title: "Scenic Views",
    description: "Wake into quiet light, open trails, and evenings built around the fire.",
  },
];

const stats = [
  { value: "6", label: "remote stays" },
  { value: "4.8+", label: "guest rating" },
  { value: "0", label: "wifi passwords" },
];

const Experience = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.18 });

  return (
    <section id="experience" className="bg-foreground py-24 text-background md:py-32 lg:py-36" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75 }}
          >
            <span className="mb-4 block text-[11px] font-normal uppercase tracking-wider text-background/50">
              The Experience
            </span>
            <h2 className="max-w-lg text-3xl font-light leading-tight tracking-tight md:text-5xl">
              Everything you need, nothing that pulls you away.
            </h2>
            <p className="mt-6 max-w-md text-sm font-light leading-7 text-background/65">
              Wild Haven keeps the comfort intentional: warm shelter, clean water, good light, and
              enough quiet for long conversations or none at all.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-background/15 border-y border-background/15">
              {stats.map((stat) => (
                <div key={stat.label} className="py-5 text-center first:text-left last:text-right">
                  <p className="text-3xl font-light">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-normal uppercase tracking-wider text-background/45">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.12 }}
            className="grid gap-5 md:grid-cols-2"
          >
            <div className="relative min-h-[420px] overflow-hidden rounded-lg md:min-h-[560px]">
              <img src={detailLake} alt="Lakeside off-grid retreat" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <Sparkles className="mb-4 h-5 w-5 text-primary" />
                <p className="text-2xl font-light leading-tight">Arrive with less. Leave with more room.</p>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="relative min-h-[220px] overflow-hidden rounded-lg">
                <img src={detailMeadow} alt="Mountain meadow retreat" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute bottom-5 left-5 right-5">
                  <Moon className="mb-3 h-5 w-5 text-primary" />
                  <p className="text-sm font-light leading-6 text-white/85">
                    Dark-sky evenings, low light, and sleep that remembers what quiet sounds like.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: 24 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.55, delay: 0.2 + index * 0.08 }}
                      className="group rounded-lg border border-background/12 bg-background/[0.06] p-5 backdrop-blur smooth-hover hover:-translate-y-1 hover:bg-background/[0.1]"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-normal tracking-tight text-background">{feature.title}</h3>
                      <p className="mt-2 text-xs font-light leading-6 text-background/60">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
