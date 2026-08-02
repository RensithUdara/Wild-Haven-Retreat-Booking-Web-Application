import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowUpDown, MapPin, Star, Tent, TreePine } from "lucide-react";
import bannerImage from "@/assets/detail-forest-1.jpg";
import { locations } from "@/data/locations";

type SortOption = "price-low" | "price-high" | "rating";

const sortLabels: Record<SortOption, string> = {
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  rating: "Highest Rated",
};

const Locations = () => {
  const [sortBy, setSortBy] = useState<SortOption>("price-low");

  const sortedLocations = useMemo(() => {
    const sorted = [...locations];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  }, [sortBy]);

  const featuredLocation = sortedLocations[0];
  const remainingLocations = sortedLocations.slice(1);
  const averagePrice = Math.round(locations.reduce((sum, location) => sum + location.price, 0) / locations.length);
  const topRating = Math.max(...locations.map((location) => location.rating));

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navigation />

      <PageHero
        image={bannerImage}
        eyebrow="Our locations"
        title="Six places to disappear into the good kind of quiet."
        description="Compare forest, lake, meadow, canyon, river, and summit stays. Each one is off-grid, private, and prepared for slow mornings."
        cta={{ label: "Explore stays", href: "#all-spots" }}
        stats={[
          { value: String(locations.length), label: "Remote stays" },
          { value: `$${averagePrice}`, label: "Average night" },
          { value: topRating.toFixed(1), label: "Top rating" },
        ]}
      />

      <main id="all-spots">
        <section className="px-6 py-24 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="mx-auto max-w-6xl"
          >
            <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <div>
                <span className="text-[11px] font-normal uppercase tracking-wider text-muted-foreground">
                  All spots
                </span>
                <h2 className="mt-4 text-4xl font-light tracking-tight text-foreground md:text-5xl">
                  Choose by landscape, pace, and price.
                </h2>
              </div>

              <div className="rounded-lg border border-border bg-card p-3 shadow-soft lg:justify-self-end">
                <div className="flex items-center gap-3">
                  <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-accent text-primary sm:flex">
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                      Sort listings
                    </p>
                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                      <SelectTrigger className="h-11 w-[220px] rounded-md bg-background text-sm font-light">
                        <SelectValue placeholder={sortLabels[sortBy]} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {featuredLocation && (
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08 }}
                className="mb-6"
              >
                <Link
                  to={`/location/${featuredLocation.id}`}
                  className="group grid overflow-hidden rounded-lg border border-border bg-card shadow-hover lg:grid-cols-[1.15fr_0.85fr]"
                >
                  <div className="relative min-h-[420px] overflow-hidden">
                    <img
                      src={featuredLocation.image}
                      alt={featuredLocation.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                    <div className="absolute left-5 top-5 rounded-full bg-background/90 px-3 py-1.5 text-[10px] font-normal uppercase tracking-wider text-foreground backdrop-blur">
                      Best match for {sortLabels[sortBy].toLowerCase()}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-7 md:p-9">
                    <div>
                      <div className="mb-5 flex flex-wrap gap-2">
                        {featuredLocation.features.map((feature) => (
                          <span
                            key={feature}
                            className="rounded-full bg-accent px-3 py-1 text-[10px] font-normal uppercase tracking-wider text-accent-foreground"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <p className="mb-3 flex items-center gap-2 text-xs font-light text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {featuredLocation.location}
                      </p>
                      <h3 className="text-4xl font-light tracking-tight text-foreground md:text-5xl">
                        {featuredLocation.name}
                      </h3>
                      <p className="mt-5 text-sm font-light leading-7 text-muted-foreground">
                        {featuredLocation.description}
                      </p>
                    </div>

                    <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-t border-border pt-6">
                      <div>
                        <p className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                          From
                        </p>
                        <p className="mt-1 text-3xl font-light text-foreground">
                          ${featuredLocation.price}
                          <span className="text-sm text-muted-foreground">/night</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1 text-sm font-light text-muted-foreground">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          {featuredLocation.rating}
                        </span>
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {remainingLocations.map((location, index) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.12 + index * 0.06 }}
                >
                  <Card className="group h-full overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">
                    <Link to={`/location/${location.id}`} className="flex h-full flex-col">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={location.image}
                          alt={location.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-light text-foreground backdrop-blur">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          {location.rating}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <p className="mb-2 flex items-center gap-2 text-xs font-light text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {location.location}
                        </p>
                        <h3 className="text-2xl font-light tracking-tight text-card-foreground">
                          {location.name}
                        </h3>
                        <p className="mt-4 line-clamp-3 text-sm font-light leading-6 text-muted-foreground">
                          {location.description}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {location.features.slice(0, 3).map((feature) => (
                            <span
                              key={feature}
                              className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-normal uppercase tracking-wider text-accent-foreground"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto flex items-end justify-between gap-4 border-t border-border pt-6">
                          <div>
                            <span className="text-2xl font-light text-foreground">${location.price}</span>
                            <span className="text-xs font-light text-muted-foreground">/night</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-[11px] font-normal uppercase tracking-wider text-primary hover:text-primary/80"
                          >
                            Details
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="px-6 pb-24 md:px-12 lg:px-16">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-lg bg-foreground text-background lg:grid-cols-[0.9fr_1.1fr]">
            <div className="p-8 md:p-10 lg:p-12">
              <TreePine className="mb-8 h-6 w-6 text-primary" />
              <h2 className="max-w-xl text-4xl font-light leading-tight tracking-tight md:text-5xl">
                Need help choosing between views?
              </h2>
              <p className="mt-6 max-w-lg text-sm font-light leading-7 text-background/62">
                Tell us whether you want water, forest shade, open sky, or a higher trailhead. We will
                point you toward the stay that fits.
              </p>
              <Button asChild className="mt-8 rounded-full bg-background text-[11px] font-normal uppercase tracking-wider text-foreground hover:bg-primary hover:text-primary-foreground">
                <Link to="/contact">
                  Ask for a recommendation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-px bg-background/15">
              {locations.slice(0, 4).map((location) => (
                <div key={location.id} className="relative min-h-[190px] overflow-hidden bg-foreground">
                  <img src={location.image} alt={location.name} className="absolute inset-0 h-full w-full object-cover opacity-75" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Tent className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-sm font-light text-white">{location.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Locations;
