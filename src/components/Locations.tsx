import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { getFeaturedLocations } from "@/data/locations";

const Locations = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.18 });
  const featuredLocations = getFeaturedLocations();
  const leadLocation = featuredLocations[0];
  const secondaryLocations = featuredLocations.slice(1);

  return (
    <section id="locations" className="bg-background py-24 md:py-32 lg:py-36" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
        >
          <div>
            <span className="mb-4 block text-[11px] font-normal uppercase tracking-wider text-muted-foreground">
              Our Locations
            </span>
            <h2 className="max-w-lg text-3xl font-light leading-tight tracking-tight text-foreground md:text-5xl">
              Featured retreats for clear skies, quiet mornings, and firelit nights.
            </h2>
          </div>
          <div className="max-w-xl lg:justify-self-end">
            <p className="text-sm font-light leading-7 text-muted-foreground">
              Each Wild Haven stay is chosen for privacy, natural beauty, and a soft landing after the
              road in. Pick the view that fits your kind of reset.
            </p>
            <Link
              to="/locations"
              className="mt-6 inline-flex items-center gap-2 text-[11px] font-normal uppercase tracking-wider text-foreground smooth-hover hover:text-primary"
            >
              View all locations
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {leadLocation && (
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <Link
                to={`/location/${leadLocation.id}`}
                className="group relative block min-h-[540px] overflow-hidden rounded-lg bg-foreground text-background shadow-hover"
              >
                <img
                  src={leadLocation.image}
                  alt={leadLocation.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />

                <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                  <span className="rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-normal uppercase tracking-wider text-foreground backdrop-blur">
                    Most secluded
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-light text-foreground backdrop-blur">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    {leadLocation.rating}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {leadLocation.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-normal uppercase tracking-wider text-white backdrop-blur"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h3 className="text-3xl font-light tracking-tight md:text-4xl">
                        {leadLocation.name}
                      </h3>
                      <p className="mt-3 flex items-center gap-2 text-sm font-light text-white/80">
                        <MapPin className="h-4 w-4" />
                        {leadLocation.location}
                      </p>
                      <p className="mt-4 max-w-xl text-sm font-light leading-7 text-white/75">
                        {leadLocation.description}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <p className="text-3xl font-light">${leadLocation.price}</p>
                      <p className="text-xs font-light uppercase tracking-wider text-white/60">per night</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          <div className="grid gap-5">
            {secondaryLocations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 36 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.18 + index * 0.08 }}
              >
                <Link
                  to={`/location/${location.id}`}
                  className="group grid min-h-[258px] overflow-hidden rounded-lg border border-border bg-card shadow-soft smooth-hover hover:-translate-y-1 hover:shadow-hover sm:grid-cols-[0.82fr_1fr]"
                >
                  <div className="relative min-h-[220px] overflow-hidden sm:min-h-full">
                    <img
                      src={location.image}
                      alt={location.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-light text-foreground backdrop-blur">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      {location.rating}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <h3 className="text-xl font-light tracking-tight text-card-foreground">
                        {location.name}
                      </h3>
                      <p className="mt-2 flex items-center gap-2 text-xs font-light text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {location.location}
                      </p>
                      <p className="mt-4 line-clamp-3 text-sm font-light leading-6 text-muted-foreground">
                        {location.description}
                      </p>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <span className="text-2xl font-light text-foreground">${location.price}</span>
                        <span className="text-xs font-light text-muted-foreground">/night</span>
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background smooth-hover group-hover:bg-primary group-hover:text-primary-foreground">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Locations;
