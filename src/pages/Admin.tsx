import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  LogOut,
  Eye,
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Home,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { mockBookings } from "@/data/bookings";
import { locations, getLocationById } from "@/data/locations";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  notes: string | null;
  paymentStatus: "paid" | "unpaid";
}

const parseDate = (value: string) => new Date(`${value}T00:00:00`);
const PAYMENT_MARKER = "PAYMENT_STATUS=paid";

const getPaymentStatus = (notes: string | null | undefined): "paid" | "unpaid" =>
  notes?.includes(PAYMENT_MARKER) ? "paid" : "unpaid";

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const { user, loading, signOut } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [timeframe, setTimeframe] = useState<"upcoming" | "past">("upcoming");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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
          notes: b.notes,
          paymentStatus: getPaymentStatus(b.notes),
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
          notes: b.status === "pending" || b.status === "confirmed" ? PAYMENT_MARKER : null,
          paymentStatus: b.status === "pending" || b.status === "confirmed" ? "paid" : "unpaid",
        }))
      );
      setFetching(false);
      return;
    }
    if (user) loadBookings();
  }, [user, isDemo, loadBookings]);

  const now = new Date();

  const locationBookings = useMemo(
    () => bookings.filter((b) => selectedLocation === "all" || b.locationId === selectedLocation),
    [bookings, selectedLocation]
  );

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return locationBookings
      .filter((b) => (timeframe === "upcoming" ? b.checkOut >= now : b.checkOut < now))
      .filter((b) => statusFilter === "all" || b.status === statusFilter)
      .filter((b) => {
        if (!query) return true;
        const location = getLocationById(b.locationId);
        return [b.guestName, b.email, b.phone ?? "", b.id, location?.name ?? b.locationId, b.paymentStatus]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationBookings, timeframe, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const active = locationBookings.filter((b) => b.status !== "cancelled");
    const totalNights = active.reduce((total, booking) => {
      const nights = Math.max(
        1,
        Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24))
      );
      return total + nights;
    }, 0);
    const upcomingArrivals = active.filter((b) => {
      const daysUntilArrival = Math.ceil((b.checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilArrival >= 0 && daysUntilArrival <= 7;
    }).length;
    const activeStays = active.filter((b) => b.checkIn <= now && b.checkOut >= now).length;

    return {
      total: locationBookings.length,
      upcoming: active.filter((b) => b.checkOut >= now).length,
      pending: locationBookings.filter((b) => b.status === "pending").length,
      confirmed: locationBookings.filter((b) => b.status === "confirmed").length,
      cancelled: locationBookings.filter((b) => b.status === "cancelled").length,
      paid: locationBookings.filter((b) => b.paymentStatus === "paid").length,
      unpaid: locationBookings.filter((b) => b.paymentStatus !== "paid").length,
      upcomingArrivals,
      avgStay: active.length ? Math.round((totalNights / active.length) * 10) / 10 : 0,
      occupancy: Math.min(100, Math.round((activeStays / Math.max(locations.length, 1)) * 100)),
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
    const booking = bookings.find((b) => b.id === id);
    if (status === "confirmed" && booking?.paymentStatus !== "paid") {
      toast({
        title: "Payment required",
        description: "This booking must be paid before admin confirmation.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast({ title: `Booking ${status}` });
  };

  const exportBookings = () => {
    const headers = ["id", "guest", "email", "phone", "location", "checkIn", "checkOut", "guests", "status", "payment", "total"];
    const rows = filteredBookings.map((booking) => {
      const location = getLocationById(booking.locationId);
      return {
        id: booking.id,
        guest: booking.guestName,
        email: booking.email,
        phone: booking.phone ?? "",
        location: location?.name ?? booking.locationId,
        checkIn: format(booking.checkIn, "yyyy-MM-dd"),
        checkOut: format(booking.checkOut, "yyyy-MM-dd"),
        guests: booking.guests,
        status: booking.status,
        payment: booking.paymentStatus,
        total: booking.totalPrice ?? "",
      };
    });
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wild-haven-bookings-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
      <Navigation variant="dark" />

      <main className="pt-24">
        <section className="border-b border-border bg-card px-6 py-5 lg:px-12">
          <div className="container mx-auto flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1 rounded-full px-3 py-1 text-[11px] font-normal uppercase tracking-wider">
                  {isDemo ? <Eye className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  {isDemo ? "Demo admin" : isAdmin === false ? "Limited access" : "Admin workspace"}
                </Badge>
                <span className="text-xs font-light text-muted-foreground">{format(new Date(), "EEE, MMM d")}</span>
              </div>
              <h1 className="text-2xl font-light tracking-tight text-foreground md:text-3xl">Booking operations</h1>
              <p className="mt-1 max-w-2xl text-sm font-light text-muted-foreground">
                {isAdmin === false
                  ? "You are viewing reservations available to your account."
                  : "Review requests, contact guests, export bookings, and keep arrivals moving."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/")} className="h-9 rounded-full text-xs font-light">
                <Home className="mr-2 h-3.5 w-3.5" />
                Site
              </Button>
              <Button variant="outline" size="sm" onClick={exportBookings} className="h-9 rounded-full text-xs font-light">
                <Download className="mr-2 h-3.5 w-3.5" />
                Export CSV
              </Button>
              {!isDemo && (
                <Button variant="outline" size="sm" onClick={loadBookings} className="h-9 rounded-full text-xs font-light">
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Refresh
                </Button>
              )}
              {isDemo ? (
                <Badge variant="outline" className="gap-1 rounded-full px-4 py-2 text-[11px] font-normal uppercase tracking-wider">
                  <Eye className="h-3.5 w-3.5" />
                  Demo mode
                </Badge>
              ) : (
                <Button variant="ghost" size="sm" onClick={signOut} className="h-9 rounded-full text-xs font-light">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign out
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="px-6 py-10 lg:px-12">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]"
            >
              <Card className="rounded-lg border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">Needs review</p>
                    <p className="mt-2 text-3xl font-light tracking-tight text-foreground">{stats.pending}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-800">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-5 text-sm font-light text-muted-foreground">
                  Pending booking requests waiting for confirmation or cancellation.
                </p>
              </Card>

              <Card className="rounded-lg border border-border bg-card p-5 shadow-soft">
                <p className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">Arrivals this week</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className="text-3xl font-light tracking-tight text-foreground">{stats.upcomingArrivals}</p>
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-5 text-sm font-light text-muted-foreground">Guests checking in during the next 7 days.</p>
              </Card>

              <Card className="rounded-lg border border-border bg-card p-5 shadow-soft">
                <p className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">Live occupancy</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className="text-3xl font-light tracking-tight text-foreground">{stats.occupancy}%</p>
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-5 text-sm font-light text-muted-foreground">Active stays across available retreat locations.</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8"
            >
              {[
                { label: "Total bookings", value: stats.total, icon: Calendar },
                { label: "Upcoming", value: stats.upcoming, icon: Users },
                { label: "Pending", value: stats.pending, icon: ShieldCheck },
                { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign },
                { label: "Paid", value: stats.paid, icon: CreditCard },
                { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2 },
                { label: "Cancelled", value: stats.cancelled, icon: XCircle },
                { label: "Avg. stay", value: `${stats.avgStay} nights`, icon: Clock },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.label} className="rounded-lg border border-border bg-card p-5 shadow-soft">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-light tracking-tight text-foreground">{item.value}</p>
                    <p className="mt-2 text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </p>
                  </Card>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tabs value={selectedLocation} onValueChange={setSelectedLocation}>
                <Card className="mb-6 rounded-lg border border-border bg-card p-4 shadow-soft">
                  <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search guest, email, booking ID, or location"
                        className="h-10 rounded-full border-border pl-9 text-sm font-light"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-10 w-full rounded-full border-border text-sm font-light lg:w-[170px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap items-center gap-2">
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
                  </div>
                  <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
                    <TabsTrigger
                      value="all"
                      className="rounded-full border border-border px-4 py-2 text-xs font-light data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      All locations
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
                    <div className="flex flex-col gap-3 border-b border-border p-6 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-[11px] font-normal uppercase tracking-wider text-muted-foreground">
                          {filteredBookings.length} {timeframe} bookings
                        </p>
                        <h2 className="mt-2 text-3xl font-light tracking-tight text-foreground">
                          {selectedLocation === "all"
                            ? "All retreats"
                            : getLocationById(selectedLocation)?.name ?? selectedLocation}
                        </h2>
                      </div>
                      <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-[11px] font-normal uppercase tracking-wider">
                        {statusFilter === "all" ? "All statuses" : statusFilter}
                      </Badge>
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
                            <TableHead className="text-[11px] uppercase tracking-wider font-normal">Payment</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-normal">Contact</TableHead>
                            {!isDemo && (
                              <TableHead className="text-[11px] uppercase tracking-wider font-normal">Actions</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBookings.map((booking) => {
                            const location = getLocationById(booking.locationId);
                            const nights = Math.ceil(
                              (booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24)
                            );
                            return (
                              <TableRow key={booking.id} className="border-border">
                                <TableCell>
                                  <div>
                                    <p className="text-sm font-normal">{booking.guestName}</p>
                                    <p className="text-xs text-muted-foreground font-light">{booking.id.slice(0, 8)}</p>
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
                                    <p className="text-xs text-muted-foreground">{nights} nights</p>
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
                                  <Badge
                                    variant="outline"
                                    className={`text-xs font-light capitalize ${
                                      booking.paymentStatus === "paid"
                                        ? "border-green-200 bg-green-100 text-green-800"
                                        : "border-orange-200 bg-orange-100 text-orange-800"
                                    }`}
                                  >
                                    {booking.paymentStatus}
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
                                          disabled={booking.paymentStatus !== "paid"}
                                          title={booking.paymentStatus !== "paid" ? "Payment required before confirmation" : "Confirm booking"}
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
                          No {timeframe} bookings match the current filters
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
