import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { CalendarDays, MapPin, Users, LogOut, Loader2, Tent, Download, Printer } from "lucide-react";
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
  confirmed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-accent text-accent-foreground",
};

const locationName = (id: string) => locations.find((l) => l.id === id)?.name ?? id;

const BookingCard = ({
  booking,
  onCancel,
}: {
  booking: BookingRow;
  onCancel?: (id: string) => void;
}) => (
  <Card className="p-6 border border-border bg-card">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-base font-light text-foreground">{locationName(booking.location_id)}</h3>
          <Badge className={`rounded-full border-0 text-[10px] uppercase tracking-wider font-normal ${statusStyles[booking.status]}`}>
            {booking.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-6 text-sm font-light text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {format(parseISO(booking.check_in), "MMM d")} – {format(parseISO(booking.check_out), "MMM d, yyyy")}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
          </span>
          {booking.total_price != null && (
            <span className="text-foreground">${Number(booking.total_price).toFixed(0)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to={`/location/${booking.location_id}`}
          className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          View spot
        </Link>
        {booking.status !== "cancelled" && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-[11px] uppercase tracking-wider font-normal"
            onClick={() =>
              generateReceiptPdf({
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
              })
            }
          >
            <Download className="mr-1.5 h-3 w-3" />
            Receipt
          </Button>
        )}
        {booking.status !== "cancelled" && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-[11px] uppercase tracking-wider font-normal"
            onClick={() =>
              printReceipt({
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
              })
            }
          >
            <Printer className="mr-1.5 h-3 w-3" />
            Print
          </Button>
        )}
        {onCancel && booking.status !== "cancelled" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full text-[11px] uppercase tracking-wider font-normal">
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-foreground">
        <div className="container mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Tent className="h-4 w-4 text-primary" />
            <span className="text-sm font-normal tracking-wide text-background">Wild Haven</span>
          </Link>
          <button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-background/60 hover:text-background transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 py-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 block">My account</span>
          <h1 className="text-2xl md:text-3xl font-light text-foreground tracking-tight mb-2">
            {profile?.full_name ? `Hello, ${profile.full_name.split(" ")[0]}` : "Your stays"}
          </h1>
          <p className="text-sm text-muted-foreground font-light mb-10">{user.email}</p>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="upcoming" className="text-[11px] uppercase tracking-wider font-normal">
                Upcoming ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="text-[11px] uppercase tracking-wider font-normal">
                Past ({past.length})
              </TabsTrigger>
              <TabsTrigger value="details" className="text-[11px] uppercase tracking-wider font-normal">
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {loadingBookings ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : upcoming.length === 0 ? (
                <Card className="p-10 text-center border border-dashed border-border bg-card">
                  <p className="text-sm text-muted-foreground font-light mb-6">You have no upcoming stays yet.</p>
                  <Button asChild className="rounded-full text-[11px] uppercase tracking-wider font-normal">
                    <Link to="/#booking">Book a stay</Link>
                  </Button>
                </Card>
              ) : (
                upcoming.map((b) => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {loadingBookings ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : past.length === 0 ? (
                <p className="text-sm text-muted-foreground font-light">No past stays to show.</p>
              ) : (
                past.map((b) => <BookingCard key={b.id} booking={b} />)
              )}
            </TabsContent>

            <TabsContent value="details">
              <Card className="p-8 border border-border bg-card">
                <form onSubmit={handleSaveProfile} className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="acc-name" className="text-[11px] uppercase tracking-wider font-normal">Full name</Label>
                    <Input id="acc-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-sm font-light" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acc-phone" className="text-[11px] uppercase tracking-wider font-normal">Phone</Label>
                    <Input id="acc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="text-sm font-light" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acc-postcode" className="text-[11px] uppercase tracking-wider font-normal">Postcode</Label>
                    <Input id="acc-postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} className="text-sm font-light" />
                  </div>
                  <Button type="submit" disabled={savingProfile} className="rounded-full text-[11px] uppercase tracking-wider font-normal">
                    {savingProfile ? "Saving..." : "Save details"}
                  </Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Account;
