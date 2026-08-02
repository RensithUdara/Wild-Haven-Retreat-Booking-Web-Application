import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Compass, Heart, Leaf, Mountain, TreePine, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import bannerImage from "@/assets/detail-lake-2.jpg";
import forestImage from "@/assets/detail-forest-1.jpg";
import meadowImage from "@/assets/detail-meadow-2.jpg";
import tentImage from "@/assets/hero-camping.jpg";

const values = [
  {
    icon: Leaf,
    title: "Sustainability",
    description: "We tread lightly, choosing systems and materials that respect the land around each stay.",
  },
  {
    icon: Heart,
    title: "Connection",
    description: "Every retreat is designed to make room for deeper connection with people, place, and self.",
  },
  {
    icon: Compass,
    title: "Simplicity",
    description: "We keep what matters and remove what interrupts, from the booking flow to the cabin floorplan.",
  },
  {
    icon: Mountain,
    title: "Authenticity",
    description: "No staged wilderness, no overbuilt escape. Just considered comfort in real landscapes.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We welcome guests who care about quiet places and the responsibility of enjoying them well.",
  },
  {
    icon: TreePine,
    title: "Mindfulness",
    description: "The pace is slower on purpose, giving attention somewhere softer to land.",
  },
];

const stats = [
  { value: "2019", label: "Founded" },
  { value: "6", label: "Remote stays" },
  { value: "100%", label: "Off-grid" },
];

const timeline = [
  {
    year: "2019",
    title: "The first clearing",
    text: "Wild Haven began with a single forest platform and a belief that rest should not feel complicated.",
  },
  {
    year: "2022",
    title: "Lakes, meadows, and slower routes",
    text: "We added new retreats only where the landscape could stay the main event.",
  },
  {
    year: "Now",
    title: "A quieter way to travel",
    text: "Every stay is still small, intentional, and built around natural rhythms.",
  },
];

const About = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navigation />

      <section className="relative min-h-screen w-full overflow-hidden">
        <motion.img
          src={bannerImage}
          alt="Serene lake surrounded by nature"
          style={{ y }}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1 }}
          className="absolute inset-0 h-[115%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 flex min-h-screen items-end px-6 pb-20 pt-32 md:px-12 lg:px-16 lg:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl text-white"
          >
            <span className="mb-5 block text-[11px] font-normal uppercase tracking-wider text-white/65">
              About Wild Haven
            </span>
            <h1 className="max-w-4xl text-5xl font-light leading-[1.02] tracking-tight md:text-7xl">
              We build places where quiet can do its work.
            </h1>
            <p className="mt-7 max-w-2xl text-sm font-light leading-7 text-white/78 md:text-base">
              Off-grid retreats for slower mornings, clear nights, and the kind of rest that follows
              you home.
            </p>
            <Link
              to="/locations"
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-xs font-normal uppercase tracking-wider text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Explore locations
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <main>
        <section className="px-6 py-16 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-border bg-card shadow-hover md:grid-cols-3"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="border-b border-border px-6 py-7 text-center last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <div className="text-3xl font-light tracking-tight text-foreground md:text-4xl">{stat.value}</div>
                <div className="mt-2 text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="px-6 py-20 md:px-12 lg:px-16 lg:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-[11px] font-normal uppercase tracking-wider text-muted-foreground">Our beginning</span>
              <h2 className="mt-4 max-w-2xl text-4xl font-light leading-tight tracking-tight md:text-5xl">
                Rest felt rare. So we made room for it.
              </h2>
              <div className="mt-8 space-y-6 text-sm font-light leading-7 text-muted-foreground md:text-base">
                <p>
                  Wild Haven started from a simple observation: modern life keeps people close to
                  everything except themselves. Screens replaced sunsets, notifications crowded out
                  birdsong, and rest became another thing to schedule.
                </p>
                <p>
                  We set out to create places where the essentials could feel generous again:
                  shelter, water, fire, silence, and a view worth waking early for.
                </p>
                <p>
                  Every location is selected for natural beauty and genuine restoration, then kept
                  intentionally simple so the landscape can stay in charge.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="grid gap-5"
            >
              <div className="relative min-h-[420px] overflow-hidden rounded-lg">
                <img src={forestImage} alt="Forest retreat pathway" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="relative min-h-[190px] overflow-hidden rounded-lg">
                  <img src={meadowImage} alt="Open meadow retreat" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="rounded-lg bg-foreground p-6 text-background">
                  <p className="text-[11px] font-normal uppercase tracking-wider text-background/45">Built for</p>
                  <p className="mt-8 text-2xl font-light leading-tight">Slow arrivals, firelit dinners, and deep sleep.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-foreground px-6 py-20 text-background md:px-12 lg:px-16 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:sticky lg:top-32 lg:self-start"
            >
              <span className="text-[11px] font-normal uppercase tracking-wider text-background/45">The why</span>
              <h2 className="mt-4 text-4xl font-light leading-tight tracking-tight md:text-5xl">
                Less signal. More attention.
              </h2>
              <p className="mt-6 max-w-sm text-sm font-light leading-7 text-background/60">
                We remove the noise so guests can rediscover the simple weight of being present.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid gap-5"
            >
              {timeline.map((item) => (
                <div key={item.year} className="grid gap-5 rounded-lg border border-background/15 bg-background/[0.06] p-6 md:grid-cols-[120px_1fr]">
                  <p className="text-2xl font-light text-primary">{item.year}</p>
                  <div>
                    <h3 className="text-xl font-light tracking-tight">{item.title}</h3>
                    <p className="mt-3 text-sm font-light leading-7 text-background/62">{item.text}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="px-6 py-20 md:px-12 lg:px-16 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
            >
              <div>
                <span className="text-[11px] font-normal uppercase tracking-wider text-muted-foreground">
                  What we stand for
                </span>
                <h2 className="mt-4 text-4xl font-light tracking-tight md:text-5xl">Our values</h2>
              </div>
              <p className="max-w-xl text-sm font-light leading-7 text-muted-foreground lg:justify-self-end">
                These principles guide every site we choose, every guest detail we prepare, and every
                experience we decide not to overcomplicate.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="group bg-card p-8 transition-colors duration-300 hover:bg-accent/70"
                >
                  <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                    <value.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-3 text-lg font-light tracking-tight">{value.title}</h3>
                  <p className="text-sm font-light leading-7 text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 md:px-12 lg:px-16">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-lg bg-foreground text-background lg:grid-cols-[1fr_0.9fr]">
            <div className="relative min-h-[360px]">
              <img src={tentImage} alt="Wild Haven tent at dusk" className="absolute inset-0 h-full w-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
            <div className="p-8 md:p-10 lg:p-12">
              <span className="text-[11px] font-normal uppercase tracking-wider text-background/45">Come stay</span>
              <h2 className="mt-4 text-4xl font-light leading-tight tracking-tight md:text-5xl">
                Choose your own quiet place.
              </h2>
              <p className="mt-6 text-sm font-light leading-7 text-background/62">
                Forest, lake, meadow, canyon, river, or summit. Each stay offers a different way back
                to the same thing: room to breathe.
              </p>
              <Link
                to="/locations"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-background px-6 py-3 text-xs font-normal uppercase tracking-wider text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Browse stays
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
