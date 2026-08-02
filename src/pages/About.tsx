import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Leaf, Heart, Compass, Mountain, Users, TreePine } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import bannerImage from "@/assets/detail-lake-2.jpg";
import forestImage from "@/assets/detail-forest-1.jpg";
import meadowImage from "@/assets/detail-meadow-2.jpg";

const values = [
  {
    icon: Leaf,
    title: "Sustainability",
    description: "We tread lightly on the earth, ensuring our retreats enhance rather than harm the natural environment.",
  },
  {
    icon: Heart,
    title: "Connection",
    description: "Fostering deep bonds between people and the natural world through meaningful wilderness experiences.",
  },
  {
    icon: Compass,
    title: "Simplicity",
    description: "Stripping away modern complexity to rediscover the joy found in life's essential elements.",
  },
  {
    icon: Mountain,
    title: "Authenticity",
    description: "Providing genuine wilderness experiences untouched by the artificial and manufactured.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Building connections between like-minded individuals who share a reverence for nature.",
  },
  {
    icon: TreePine,
    title: "Mindfulness",
    description: "Encouraging presence and awareness through the calming influence of natural surroundings.",
  },
];

const stats = [
  { value: "2019", label: "Founded" },
  { value: "3", label: "Remote retreats" },
  { value: "100%", label: "Off-grid stays" },
];

const About = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navigation />

      <section className="relative min-h-[78vh] w-full overflow-hidden">
        <motion.img
          src={bannerImage}
          alt="Serene lake surrounded by nature"
          style={{ y }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 h-[120%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 flex min-h-[78vh] items-end px-6 pb-16 pt-32 md:px-12 lg:px-16 lg:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl text-white"
          >
            <span className="mb-4 block text-[11px] uppercase tracking-wider text-white/75">About Wild Haven</span>
            <h1 className="max-w-2xl text-4xl font-light tracking-tight md:text-5xl lg:text-6xl">
              Places designed for quiet, not escape.
            </h1>
            <p className="mt-6 max-w-xl text-sm font-light leading-7 text-white/85 md:text-base">
              We build off-grid retreats that bring people back to slower days, clear nights, and the kind of rest
              that lingers after you leave.
            </p>
            <Link
              to="/locations"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-xs uppercase tracking-wider text-foreground transition-colors hover:bg-white/90"
            >
              Explore Locations
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <main>
        <section className="px-6 pb-10 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-border border-y border-border bg-background/95"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-6 text-center md:py-8">
                <div className="text-2xl font-light tracking-tight text-foreground md:text-3xl">{stat.value}</div>
                <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground md:text-[11px]">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="px-6 py-20 md:px-12 lg:px-16 lg:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-lg">
                <img src={forestImage} alt="Forest retreat pathway" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-8 right-6 hidden w-44 overflow-hidden rounded-lg border-4 border-background shadow-lg md:block">
                <img src={meadowImage} alt="Open meadow retreat" className="aspect-[4/3] h-full w-full object-cover" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">About Us</span>
              <h2 className="mt-3 max-w-xl text-3xl font-light tracking-tight md:text-4xl">
                We started with a simple belief: rest should feel natural again.
              </h2>

              <div className="mt-8 space-y-6 text-sm font-light leading-7 text-muted-foreground md:text-base">
                <p>
                  Wild Haven was born from a simple observation: in our hyper-connected world, true rest has become
                  increasingly rare. We watched as screens replaced sunsets, notifications drowned out birdsong, and
                  the constant hum of digital life left people feeling more disconnected than ever.
                </p>
                <p>
                  Founded in 2019, we set out to create spaces where people could step away from the noise and
                  rediscover what it means to be truly present. Our retreats aren't about escaping life - they're about
                  returning to it, in its most essential and beautiful form.
                </p>
                <p>
                  Each of our locations has been carefully selected not just for its natural beauty, but for its ability
                  to facilitate genuine restoration. From ancient forests to pristine lakeshores, every Wild Haven
                  retreat offers a doorway back to the rhythms that sustained humanity for millennia.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-secondary/30 px-6 py-20 md:px-12 lg:px-16 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:sticky lg:top-32 lg:self-start"
            >
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">The Why</span>
              <h2 className="mt-3 text-3xl font-light tracking-tight md:text-4xl">Why Off-Grid Retreats Matter</h2>
              <p className="mt-5 max-w-sm text-sm font-light leading-7 text-muted-foreground">
                Less signal. More attention. More space to hear what the day is actually saying.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6 text-sm font-light leading-7 text-muted-foreground md:text-base"
            >
              <p>
                The average person now spends over seven hours a day looking at screens. Our nervous systems, evolved
                over millions of years in natural environments, are under constant assault from artificial stimuli. The
                result? Epidemic levels of anxiety, burnout, and a pervasive sense of disconnection.
              </p>
              <p>
                Off-grid retreats offer something profound: the opportunity to reset. When we remove ourselves from the
                digital matrix, remarkable things happen. Stress hormones drop. Sleep improves. Creativity returns. We
                begin to hear our own thoughts again.
              </p>
              <p>
                But it's not just about what we remove - it's about what we rediscover. The crackle of a fire. The
                weight of silence. The slow unfurling of time when it's no longer sliced into notifications and
                deadlines. These aren't luxuries; they're necessities that modern life has convinced us we can live
                without.
              </p>
              <p>
                At Wild Haven, we believe that reconnecting with nature isn't an escape from reality - it's a return to
                it. And in that return, we find not just rest, but renewal.
              </p>
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
              className="mb-16 text-center"
            >
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">What We Stand For</span>
              <h2 className="mt-3 text-3xl font-light tracking-tight md:text-4xl">Our Values</h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
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
      </main>

      <Footer />
    </div>
  );
};

export default About;
