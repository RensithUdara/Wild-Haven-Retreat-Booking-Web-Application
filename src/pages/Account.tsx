import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  Download,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Printer,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import PageHero from "@/components/PageHero";
import Footer from "@/components/Footer";
import { generateReceiptPdf, printReceipt } from "@/lib/receipt";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { locations } from "@/data/locations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accountHeroImage from "@/assets/detail-lake-1.jpg";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface BookingRow {
  id: string;
  location_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string;
  email: string;
  phone: string | null;
  total_price: number | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
}

const statusStyles: Record<BookingRow["status"], string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-primary/15 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-accent text-accent-foreground",
};

const getLocation = (id: string) => locations.find((l) => l.id === id);
const locationName = (id: string) => getLocation(id)?.name ?? id;

const EmptyState = ({ title, action }: { title: string; action?: boolean }) => (
  <Card className="border border-dashed border-border bg-card p-10 text-center">
    <p className="text-sm font-light text-muted-foreground">{title}</p>
    {action && (
      <Button asChild className="mt-6 rounded-full text-[11px] font-normal uppercase tracking-wider">
        <Link to="/#booking">Book a stay</Link>
      </Button>
    )}
  </Card>
);

const BookingCard = ({
  booking,
  onCancel,
}: {
  booking: BookingRow;
  onCancel?: (id: string) => void;
}) => {
  const location = getLocation(booking.location_id);

  const receiptPayload = {
    reference: booking.id.slice(0, 8).toUpperCase(),
    locationId: booking.location_id,
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    guests: booking.guests,
    guestName: booking.guest_name,
    email: booking.email,
    phone: booking.phone,
    totalPrice: booking.total_price,
    status: booking.status,
    issuedAt: booking.created_at,
  };

  return (
    <Card className="grid overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover lg:grid-cols-[260px_1fr]">
      <Link to={`/location/${booking.location_id}`} className="relative min-h-[220px] overflow-hidden lg:min-h-full">
        <img
          src={location?.image ?? locations[0]?.image}
          alt={locationName(booking.location_id)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[10px] font-normal uppercase tracking-wider text-white/60">Booking</p>
          <p className="mt-1 text-sm font-light text-white">{booking.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </Link>

      <div className="p-6 md:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-light tracking-tight text-foreground">
                {locationName(booking.location_id)}
              </h3>
              <Badge className={`rounded-full border-0 px-3 py-1 text-[10px] font-normal uppercase tracking-wider ${statusStyles[booking.status]}`}>
                {booking.status}
              </Badge>
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs font-light text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {location?.location ?? "Wild Haven"}
            </p>
          </div>

          {booking.total_price != null && (
            <div className="rounded-lg bg-accent/40 px-5 py-4 xl:text-right">
              <p className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="mt-1 text-2xl font-light text-foreground">${Number(booking.total_price).toFixed(0)}</p>
            </div>
          )}
        </div>

        <div className="mt-7 grid gap-3 border-y border-border py-5 text-sm font-light text-muted-foreground sm:grid-cols-3">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            {format(parseISO(booking.check_in), "MMM d")} - {format(parseISO(booking.check_out), "MMM d, yyyy")}
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
          </span>
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            {booking.email}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-full text-[11px] font-normal uppercase tracking-wider">
            <Link to={`/location/${booking.location_id}`}>
              View spot
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
          {booking.status !== "cancelled" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-[11px] font-normal uppercase tracking-wider"
                onClick={() => generateReceiptPdf(receiptPayload)}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Receipt
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-[11px] font-normal uppercase tracking-wider"
                onClick={() => printReceipt(receiptPayload)}
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print
              </Button>
            </>
          )}
          {onCancel && booking.status !== "cancelled" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full text-[11px] font-normal uppercase tracking-wider">
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your stay at {locationName(booking.location_id)} on{" "}
                    {format(parseISO(booking.check_in), "MMM d, yyyy")} will be cancelled.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep booking</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onCancel(booking.id)}>Cancel booking</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </Card>
  );
};

const Account = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth?next=/account", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setPostcode(profile?.postcode ?? "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoadingBookings(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("check_in", { ascending: true });
      if (!active) return;
      if (error) toast.error("Could not load your bookings");
      setBookings((data as BookingRow[]) ?? []);
      setLoadingBookings(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const { upcoming, past } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      upcoming: bookings.filter((b) => b.check_out >= today && b.status !== "cancelled"),
      past: bookings.filter((b) => b.check_out < today || b.status === "cancelled"),
    };
  }, [bookings]);

  const nextBooking = upcoming[0];
  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "traveler";
  const totalSpend = bookings.reduce((sum, booking) => sum + Number(booking.total_price ?? 0), 0);

  const handleCancel = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      toast.error("Could not cancel this booking");
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b)));
    toast.success("Booking cancelled");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName.trim(), phone: phone.trim(), postcode: postcode.trim() });
    setSavingProfile(false);
    if (error) {
      toast.error("Could not save your details");
      return;
    }
    await refreshProfile();
    toast.success("Details saved");
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <PageHero
          image={accountHeroImage}
          eyebrow="My account"
          title={`Hello, ${firstName}. Your next quiet stay is waiting here.`}
          description={user.email ?? undefined}
          stats={[
            { value: String(upcoming.length), label: "Upcoming" },
            { value: String(past.length), label: "Past" },
            { value: `$${totalSpend.toFixed(0)}`, label: "Booked" },
          ]}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="inline-flex h-10 items-center gap-2 rounded-full border border-background/20 bg-background/10 px-5 text-[11px] font-normal uppercase tracking-wider text-background/75 transition-colors hover:bg-background hover:text-foreground">
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out of Wild Haven?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will need to sign in again to view bookings, receipts, and saved guest details.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay signed in</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                >
                  Sign out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </PageHero>

        <section className="py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <Tabs defaultValue="upcoming" className="mx-auto max-w-6xl">
              <div className="mb-8 flex flex-col gap-4 rounded-lg border border-border bg-card p-3 shadow-hover sm:flex-row sm:items-center sm:justify-between">
                <TabsList className="h-auto bg-secondary/70 p-1">
                  <TabsTrigger value="upcoming" className="rounded-md px-4 py-2 text-[11px] font-normal uppercase tracking-wider">
                    Upcoming ({upcoming.length})
                  </TabsTrigger>
                  <TabsTrigger value="past" className="rounded-md px-4 py-2 text-[11px] font-normal uppercase tracking-wider">
                    Past ({past.length})
                  </TabsTrigger>
                  <TabsTrigger value="details" className="rounded-md px-4 py-2 text-[11px] font-normal uppercase tracking-wider">
                    Edit profile
                  </TabsTrigger>
                </TabsList>
                <Button asChild className="rounded-full bg-foreground text-[11px] font-normal uppercase tracking-wider text-background hover:bg-primary hover:text-primary-foreground">
                  <Link to="/#booking">Book another stay</Link>
                </Button>
              </div>

              {nextBooking && (
                <Card className="mb-8 overflow-hidden rounded-lg border border-border bg-card shadow-soft">
                  <div className="grid md:grid-cols-[1fr_1.2fr]">
                    <div className="relative min-h-[260px]">
                      <img
                        src={getLocation(nextBooking.location_id)?.image ?? locations[0]?.image}
                        alt={locationName(nextBooking.location_id)}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                      <div className="absolute bottom-5 left-5 right-5">
                        <p className="text-[10px] font-normal uppercase tracking-wider text-white/60">Next stay</p>
                        <p className="mt-2 text-2xl font-light text-white">{locationName(nextBooking.location_id)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between p-7">
                      <div>
                        <p className="text-[11px] font-normal uppercase tracking-wider text-muted-foreground">
                          Arrival
                        </p>
                        <p className="mt-2 text-3xl font-light tracking-tight text-foreground">
                          {format(parseISO(nextBooking.check_in), "EEEE, MMM d")}
                        </p>
                        <p className="mt-3 text-sm font-light text-muted-foreground">
                          {format(parseISO(nextBooking.check_in), "MMM d")} -{" "}
                          {format(parseISO(nextBooking.check_out), "MMM d, yyyy")} with {nextBooking.guests}{" "}
                          {nextBooking.guests === 1 ? "guest" : "guests"}.
                        </p>
                      </div>
                      <div className="mt-8 flex flex-wrap gap-3">
                        <Button asChild variant="outline" className="rounded-full text-[11px] font-normal uppercase tracking-wider">
                          <Link to={`/location/${nextBooking.location_id}`}>View retreat</Link>
                        </Button>
                        <Button asChild className="rounded-full bg-foreground text-[11px] font-normal uppercase tracking-wider text-background hover:bg-primary hover:text-primary-foreground">
                          <Link to="/#booking">Plan another</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <TabsContent value="upcoming" className="space-y-5">
                {loadingBookings ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : upcoming.length === 0 ? (
                  <EmptyState title="You have no upcoming stays yet." action />
                ) : (
                  upcoming.map((b) => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-5">
                {loadingBookings ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : past.length === 0 ? (
                  <EmptyState title="No past stays to show." />
                ) : (
                  past.map((b) => <BookingCard key={b.id} booking={b} />)
                )}
              </TabsContent>

              <TabsContent value="details">
                <Card className="grid overflow-hidden rounded-lg border border-border bg-card shadow-soft lg:grid-cols-[0.75fr_1.25fr]">
                  <div className="bg-foreground p-8 text-background">
                    <Pencil className="mb-8 h-5 w-5 text-primary" />
                    <h2 className="text-3xl font-light leading-tight tracking-tight">Edit profile</h2>
                    <p className="mt-4 text-sm font-light leading-7 text-background/60">
                      Update the name and phone number used for future booking requests.
                    </p>
                    <div className="mt-8 space-y-3 text-sm font-light text-background/70">
                      <p className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-primary" />
                        {user.email}
                      </p>
                      {phone && (
                        <p className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-primary" />
                          {phone}
                        </p>
                      )}
                    </div>
                    <div className="mt-8 rounded-lg border border-background/15 bg-background/[0.06] p-4">
                      <p className="flex items-start gap-3 text-xs font-light leading-6 text-background/62">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        Email is used for sign-in and receipts, so it cannot be edited here.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="grid gap-5 p-7 md:grid-cols-2 md:p-8">
                    <div className="md:col-span-2">
                      <Label htmlFor="acc-email" className="flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-wider">
                        <Mail className="h-3 w-3" />
                        Email
                      </Label>
                      <Input
                        id="acc-email"
                        value={user.email ?? ""}
                        readOnly
                        disabled
                        className="mt-2 h-12 bg-muted/50 text-sm font-light text-muted-foreground"
                      />
                      <p className="mt-2 text-xs font-light text-muted-foreground">
                        Email changes are not available from this page.
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="acc-name" className="flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-wider">
                        <User className="h-3 w-3" />
                        Full name
                      </Label>
                      <Input
                        id="acc-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-2 h-12 text-sm font-light"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="acc-phone" className="flex items-center gap-1.5 text-[11px] font-normal uppercase tracking-wider">
                        <Phone className="h-3 w-3" />
                        Phone
                      </Label>
                      <Input
                        id="acc-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 014-0188"
                        className="mt-2 h-12 text-sm font-light"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Button
                        type="submit"
                        disabled={savingProfile}
                        className="rounded-full bg-foreground text-[11px] font-normal uppercase tracking-wider text-background hover:bg-primary hover:text-primary-foreground"
                      >
                        {savingProfile ? "Saving..." : "Save profile"}
                      </Button>
                    </div>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
