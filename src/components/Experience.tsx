import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Droplets, Leaf, Moon, Sparkles, Sun, WifiOff } from "lucide-react";
import detailLake from "@/assets/detail-lake-2.jpg";
import detailMeadow from "@/assets/detail-meadow-1.jpg";

const features = [
  {
    icon: Leaf,
    title: "Off-grid by design",
    description: "Solar power, composting systems, and low-impact details keep each stay light on the land.",
  },
  {
    icon: WifiOff,
    title: "Signal-free stays",
    description: "No wifi passwords, no pings, and no pressure to be reachable while the fire is going.",
  },
  {
    icon: Droplets,
    title: "Simple comforts",
    description: "Fresh spring water, clean facilities, and the practical essentials are ready before arrival.",
  },
  {
    icon: Sun,
    title: "Unfiltered views",
    description: "Wake with the light, walk straight onto the trail, and settle into dark-sky evenings.",
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
    <section id="experience" className="overflow-hidden bg-foreground py-24 text-background md:py-32 lg:py-36" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75 }}
          className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end"
        >
          <div>
            <span className="mb-4 block text-[11px] font-normal uppercase tracking-wider text-background/50">
              The Experience
            </span>
            <h2 className="max-w-3xl text-4xl font-light leading-[1.05] tracking-tight md:text-6xl">
              Comfort that stays quiet.
            </h2>
          </div>

          <div className="max-w-xl lg:justify-self-end">
            <p className="text-sm font-light leading-7 text-background/65">
              Wild Haven keeps the stay intentional: warm shelter, clean water, useful light, and
              enough stillness for long conversations or none at all.
            </p>
            <div className="mt-7 grid grid-cols-3 divide-x divide-background/15 border-y border-background/15">
              {stats.map((stat) => (
                <div key={stat.label} className="px-4 py-4 first:pl-0 last:pr-0">
                  <p className="text-2xl font-light md:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-normal uppercase tracking-wider text-background/45">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.12 }}
          className="mt-14 grid gap-5 lg:grid-cols-[1.42fr_0.58fr]"
        >
          <div className="relative min-h-[520px] overflow-hidden rounded-lg md:min-h-[620px]">
            <img src={detailLake} alt="Lakeside off-grid retreat" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-9">
              <Sparkles className="mb-5 h-5 w-5 text-primary" />
              <p className="max-w-xl text-3xl font-light leading-tight md:text-5xl">
                Arrive with less. Leave with more room.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="relative min-h-[300px] overflow-hidden rounded-lg">
              <img src={detailMeadow} alt="Mountain meadow retreat" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <Moon className="mb-4 h-5 w-5 text-primary" />
                <p className="text-xl font-light leading-tight">
                  Dark-sky evenings and sleep that remembers what quiet sounds like.
                </p>
              </div>
            </div>

            <div className="flex min-h-[300px] flex-col justify-between rounded-lg border border-background/15 bg-background/[0.06] p-6">
              <p className="text-[11px] font-normal uppercase tracking-wider text-background/45">
                What stays included
              </p>
              <p className="mt-8 text-2xl font-light leading-tight">
                Shelter, water, fire setup, trail notes, and a private place to disappear for a while.
              </p>
              <a
                href="#booking"
                className="mt-8 inline-flex w-fit items-center rounded-full bg-background px-5 py-3 text-[11px] font-normal uppercase tracking-wider text-foreground smooth-hover hover:bg-primary hover:text-primary-foreground"
              >
                Check dates
              </a>
            </div>
          </div>
        </motion.div>

        <div className="mt-5 grid overflow-hidden rounded-lg border border-background/15 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.2 + index * 0.07 }}
                className="border-b border-background/15 bg-background/[0.04] p-6 last:border-b-0 md:border-r md:last:border-r-0 lg:border-b-0"
              >
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-light tracking-tight text-background">{feature.title}</h3>
                <p className="mt-3 text-xs font-light leading-6 text-background/58">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experience;
