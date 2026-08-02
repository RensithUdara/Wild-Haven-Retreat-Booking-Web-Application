import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar, Users, DollarSign, MapPin, Mail, Phone, LogOut, Eye, ShieldCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { mockBookings } from "@/data/bookings";
import { locations, getLocationById } from "@/data/locations";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import adminHeroImage from "@/assets/detail-forest-2.jpg";

interface AdminBooking {
  id: string;
  locationId: string;
  guestName: string;
  email: string;
  phone: string | null;
  guests: number;
  checkIn: Date;
  checkOut: Date;
  status: string;
  totalPrice: number | null;
}

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const { user, loading, signOut } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [timeframe, setTimeframe] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(isDemo ? true : null);
  const [fetching, setFetching] = useState(!isDemo);

  useEffect(() => {
    if (!loading && !user && !isDemo) {
      navigate("/auth?next=/admin");
    }
  }, [loading, user, navigate, isDemo]);

  const loadBookings = useCallback(async () => {
    setFetching(true);
    const { data: adminRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user!.id)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(Boolean(adminRow));


    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("check_in", { ascending: true });

    if (error) {
      toast({ title: "Could not load bookings", description: error.message, variant: "destructive" });
    } else {
      setBookings(
        (data ?? []).map((b) => ({
          id: b.id,
          locationId: b.location_id,
          guestName: b.guest_name,
          email: b.email,
          phone: b.phone,
          guests: b.guests,
          checkIn: parseDate(b.check_in),
          checkOut: parseDate(b.check_out),
          status: b.status,
          totalPrice: b.total_price,
        }))
      );
    }
    setFetching(false);
  }, [user]);

  useEffect(() => {
    if (isDemo) {
      setBookings(
        mockBookings.map((b) => ({
          id: b.id,
          locationId: b.locationId,
          guestName: b.guestName,
          email: b.email,
          phone: b.phone,
          guests: b.guests,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          status: b.status,
          totalPrice: null,
        }))
      );
      setFetching(false);
      return;
    }
    if (user) loadBookings();
  }, [user, isDemo, loadBookings]);

  const now = new Date();

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => selectedLocation === "all" || b.locationId === selectedLocation)
      .filter((b) => (timeframe === "upcoming" ? b.checkOut >= now : b.checkOut < now));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, selectedLocation, timeframe]);

  const locationBookings = useMemo(
    () => bookings.filter((b) => selectedLocation === "all" || b.locationId === selectedLocation),
    [bookings, selectedLocation]
  );

  const stats = useMemo(() => {
    const active = locationBookings.filter((b) => b.status !== "cancelled");
    return {
      total: locationBookings.length,
      upcoming: active.filter((b) => b.checkOut >= now).length,
      pending: locationBookings.filter((b) => b.status === "pending").length,
      revenue: active.reduce((total, booking) => {
        if (booking.totalPrice != null) return total + Number(booking.totalPrice);
        const location = getLocationById(booking.locationId);
        if (!location) return total;
        const nights = Math.ceil(
          (booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );
        return total + location.price * nights;
      }, 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationBookings]);

  const updateStatus = async (id: string, status: "confirmed" | "cancelled") => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast({ title: `Booking ${status}` });
  };

  if ((loading || fetching) && !isDemo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground font-light">Loading...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <PageHero
          image={adminHeroImage}
          eyebrow={isDemo ? "Admin demo" : "Admin dashboard"}
          title="Manage stays, guests, and booking flow from one quiet place."
          description={
            isAdmin === false
              ? "You're viewing your own reservations. Admin access is required to see every guest booking."
              : "Monitor bookings, filter retreats, confirm requests, and keep guest communication close at hand."
          }
          stats={[
            { value: String(stats.total), label: "Total bookings" },
            { value: String(stats.upcoming), label: "Upcoming" },
            { value: `$${stats.revenue.toLocaleString()}`, label: "Est. revenue" },
          ]}
        >
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="rounded-full border-background/20 bg-background/10 text-[11px] font-normal uppercase tracking-wider text-background hover:bg-background hover:text-foreground"
            >
              Back to home
            </Button>
            {isDemo ? (
              <Badge variant="outline" className="gap-1 rounded-full border-background/20 bg-background/10 px-4 py-2 text-[11px] font-normal uppercase tracking-wider text-background">
                <Eye className="h-3.5 w-3.5" />
                Demo mode
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="rounded-full border-background/20 bg-background/10 text-[11px] font-normal uppercase tracking-wider text-background hover:bg-background hover:text-foreground"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign out
              </Button>
            )}
          </div>
        </PageHero>

        <section className="px-6 py-24 lg:px-12">
          <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 grid gap-4 md:grid-cols-4"
          >
            {[
              { label: "Total bookings", value: stats.total, icon: Calendar },
              { label: "Upcoming", value: stats.upcoming, icon: Users },
              { label: "Pending", value: stats.pending, icon: ShieldCheck },
              { label: "Est. revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="rounded-lg border border-border bg-card p-6 shadow-soft">
                  <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-3xl font-light tracking-tight text-foreground">{item.value}</p>
                  <p className="mt-2 text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                </Card>
              );
            })}
          </motion.div>

          {/* Location Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs defaultValue="all" onValueChange={setSelectedLocation}>
              <Card className="mb-6 rounded-lg border border-border bg-card p-4 shadow-soft">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {(["upcoming", "past"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`rounded-full border px-4 py-2 text-[11px] font-normal uppercase tracking-wider transition-colors ${
                        timeframe === tf
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
                <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
                  <TabsTrigger
                    value="all"
                    className="rounded-full border border-border px-4 py-2 text-xs font-light data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    All Locations
                  </TabsTrigger>
                  {locations.map((loc) => (
                    <TabsTrigger
                      key={loc.id}
                      value={loc.id}
                      className="rounded-full border border-border px-4 py-2 text-xs font-light data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {loc.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Card>

              <TabsContent value={selectedLocation} className="mt-0">
                <Card className="overflow-hidden rounded-lg border border-border bg-card shadow-hover">
                  <div className="border-b border-border p-6">
                    <p className="text-[11px] font-normal uppercase tracking-wider text-muted-foreground">
                      {timeframe} bookings
                    </p>
                    <h2 className="mt-2 text-3xl font-light tracking-tight text-foreground">
                      {selectedLocation === "all"
                        ? "All retreats"
                        : getLocationById(selectedLocation)?.name ?? selectedLocation}
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border bg-secondary/40">
                          <TableHead className="text-[11px] uppercase tracking-wider font-normal">Guest</TableHead>
                          <TableHead className="text-[11px] uppercase tracking-wider font-normal">Location</TableHead>
                          <TableHead className="text-[11px] uppercase tracking-wider font-normal">Dates</TableHead>
                          <TableHead className="text-[11px] uppercase tracking-wider font-normal">Guests</TableHead>
                          <TableHead className="text-[11px] uppercase tracking-wider font-normal">Status</TableHead>
                          <TableHead className="text-[11px] uppercase tracking-wider font-normal">Contact</TableHead>
                          {!isDemo && (
                            <TableHead className="text-[11px] uppercase tracking-wider font-normal">Actions</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => {
                          const location = getLocationById(booking.locationId);
                          return (
                            <TableRow key={booking.id} className="border-border">
                              <TableCell>
                                <div>
                                  <p className="text-sm font-normal">{booking.guestName}</p>
                                  <p className="text-xs text-muted-foreground font-light">
                                    {booking.id.slice(0, 8)}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 text-primary" />
                                  <span className="text-sm font-light">{location?.name || booking.locationId}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-light">
                                  <p>{format(booking.checkIn, "MMM d")} - {format(booking.checkOut, "MMM d, yyyy")}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-primary" />
                                  <span className="text-sm font-light">{booking.guests}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-xs font-light capitalize ${getStatusColor(booking.status)}`}
                                >
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <a
                                    href={`mailto:${booking.email}`}
                                    className="text-xs text-muted-foreground hover:text-primary font-light flex items-center gap-1"
                                  >
                                    <Mail className="h-3 w-3" />
                                    {booking.email}
                                  </a>
                                  {booking.phone && (
                                    <a
                                      href={`tel:${booking.phone}`}
                                      className="text-xs text-muted-foreground hover:text-primary font-light flex items-center gap-1"
                                    >
                                      <Phone className="h-3 w-3" />
                                      {booking.phone}
                                    </a>
                                  )}
                                </div>
                              </TableCell>
                              {!isDemo && (
                                <TableCell>
                                  <div className="flex gap-2">
                                    {booking.status !== "confirmed" && booking.status !== "cancelled" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 rounded-full px-3 text-[11px] font-light"
                                        onClick={() => updateStatus(booking.id, "confirmed")}
                                      >
                                        Confirm
                                      </Button>
                                    )}
                                    {booking.status !== "cancelled" && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 rounded-full px-3 text-[11px] font-light text-destructive hover:text-destructive"
                                        onClick={() => updateStatus(booking.id, "cancelled")}
                                      >
                                        Cancel
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredBookings.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-sm text-muted-foreground font-light">
                        No {timeframe} bookings found for this location
                      </p>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
