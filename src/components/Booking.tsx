import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-day-picker";
import { format, addDays, startOfDay } from "date-fns";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import { CalendarDays, Users, MapPin, ArrowRight, ArrowLeft, CheckCircle, User, Phone, Mail, MapPinned, ShieldCheck, Download, Printer, Pencil, CreditCard, LockKeyhole, ReceiptText } from "lucide-react";
import { locations } from "@/data/locations";
import { generateReceiptPdf, printReceipt } from "@/lib/receipt";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const DRAFT_KEY = "wh_booking_draft";
const PAYMENT_MARKER = "PAYMENT_STATUS=paid";

const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};


const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

const Booking = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ id: string; created_at: string } | null>(null);
  const [editStay, setEditStay] = useState(false);
  const [editContact, setEditContact] = useState(false);


  // Form step state
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);

  // Step 1 fields - changed to date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined
  });
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState("");
  const [bookedRanges, setBookedRanges] = useState<{ from: Date; to: Date }[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Step 2 fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [postcode, setPostcode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [paymentName, setPaymentName] = useState("");
  const [paymentCard, setPaymentCard] = useState("");
  const [paymentExpiry, setPaymentExpiry] = useState("");
  const [paymentCvc, setPaymentCvc] = useState("");


  // Prefill contact details for signed-in guests
  useEffect(() => {
    if (user) {
      setEmail((prev) => prev || user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setName((prev) => prev || profile.full_name || "");
      setPhone((prev) => prev || profile.phone || "");
      setPostcode((prev) => prev || profile.postcode || "");
    }
  }, [profile]);

  // Restore a draft saved before the guest was sent to sign in
  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    sessionStorage.removeItem(DRAFT_KEY);
    try {
      const d = JSON.parse(raw);
      if (d.from) setDateRange({ from: new Date(d.from), to: d.to ? new Date(d.to) : undefined });
      if (d.location) setLocation(d.location);
      if (d.guests) setGuests(d.guests);
      if (d.name) setName(d.name);
      if (d.phone) setPhone(d.phone);
      if (d.postcode) setPostcode(d.postcode);
      setStep(2);
    } catch {
      // ignore malformed drafts
    }
  }, []);

  // Load unavailable date ranges for the selected campsite
  useEffect(() => {
    if (!location) {
      setBookedRanges([]);
      return;
    }
    let cancelled = false;
    setLoadingAvailability(true);
    supabase
      .rpc("get_booked_ranges", { _location_id: location })
      .then(({ data, error }) => {
        if (cancelled) return;
        setLoadingAvailability(false);
        if (error) {
          setBookedRanges([]);
          return;
        }
        const ranges = (data ?? []).map((r) => ({
          // check_out is the departure day, so the last unavailable night is the day before
          from: startOfDay(new Date(`${r.check_in}T00:00:00`)),
          to: startOfDay(addDays(new Date(`${r.check_out}T00:00:00`), -1)),
        }));
        setBookedRanges(ranges);
        setDateRange((prev) => {
          if (!prev?.from || !prev?.to) return prev;
          const clash = ranges.some(
            (r) => startOfDay(prev.from!) <= r.to && startOfDay(addDays(prev.to!, -1)) >= r.from
          );
          if (!clash) return prev;
          toast.error("Your selected dates aren't available at this campsite");
          return { from: undefined, to: undefined };
        });

      });
    return () => {
      cancelled = true;
    };
  }, [location]);

  const isUnavailable = (date: Date) => {
    const d = startOfDay(date);
    return bookedRanges.some((r) => d >= r.from && d <= r.to);
  };

  const rangeHasUnavailable = (from: Date, to: Date) =>
    bookedRanges.some((r) => startOfDay(from) <= r.to && startOfDay(addDays(to, -1)) >= r.from);

  const handleSelectRange = (range: DateRange | undefined) => {
    if (range?.from && range?.to && rangeHasUnavailable(range.from, range.to)) {
      toast.error("Those dates overlap an existing booking at this campsite");
      setDateRange({ from: range.from, to: undefined });
      return;
    }
    setDateRange(range);
  };


  const handleStep1Continue = () => {
    if (!dateRange?.from || !dateRange?.to || !location || !guests) {
      toast.error("Please fill in all fields including check-in and check-out dates");
      return;
    }
    setDirection(1);
    setStep(2);
  };

  const handleStep2Back = () => {
    setDirection(-1);
    setStep(1);
  };

  const handleStep2Continue = () => {
    if (!name || !phone || !email || !postcode) {
      toast.error("Please fill in all contact details");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select your check-in and check-out dates");
      return;
    }

    setDirection(1);
    setStep(3);
  };

  const handleStep3Back = () => {
    setDirection(-1);
    setStep(2);
  };

  const handleStep3Continue = () => {
    if (!agreed) {
      toast.error("Please accept the cancellation policy to continue");
      return;
    }
    setPaymentName((prev) => prev || name);
    setDirection(1);
    setStep(4);
  };

  const handlePaymentBack = () => {
    setDirection(-1);
    setStep(3);
  };

  const handleConfirm = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select your check-in and check-out dates");
      return;
    }

    if (!location || !guests) {
      toast.error("Please choose a campsite and number of guests");
      return;
    }

    if (!name || !phone || !email || !postcode) {
      toast.error("Please fill in all contact details");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!agreed) {
      toast.error("Please accept the cancellation policy to continue");
      return;
    }

    const cleanCard = paymentCard.replace(/\s/g, "");
    if (!paymentName.trim() || cleanCard.length < 12 || !paymentExpiry.trim() || paymentCvc.trim().length < 3) {
      toast.error("Please complete the payment details before booking");
      return;
    }

    if (!user) {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
          location,
          guests,
          name,
          phone,
          postcode,
        })
      );
      toast.info("Sign in to confirm your booking — we've saved your details.");
      navigate("/auth?next=/%23booking");
      return;
    }

    const nights = Math.max(
      1,
      Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    );
    const nightlyRate = locations.find((l) => l.id === location)?.price ?? 0;

    setSubmitting(true);
    const { data: userData, error: sessionError } = await supabase.auth.getUser();
    const activeUser = userData.user;

    if (sessionError || !activeUser) {
      setSubmitting(false);
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
          location,
          guests,
          name,
          phone,
          postcode,
        })
      );
      toast.info("Sign in to confirm your booking - we've saved your details.");
      navigate("/auth?next=/%23booking");
      return;
    }

    const { data: inserted, error } = await supabase
      .from("bookings")
      .insert({
        user_id: activeUser.id,
        location_id: location,
        check_in: format(dateRange.from, "yyyy-MM-dd"),
        check_out: format(dateRange.to, "yyyy-MM-dd"),
        guests: parseInt(guests, 10) || 1,
        guest_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        postcode: postcode.trim(),
        total_price: nights * nightlyRate,
        notes: `${PAYMENT_MARKER}; PAYMENT_REFERENCE=WH-PAY-${Date.now()}; PAYMENT_METHOD=card`,
      })
      .select("id, created_at")
      .single();
    setSubmitting(false);


    if (error) {
      console.error("Booking insert failed", error);
      if (error.code === "23P01" || /bookings_no_overlap/.test(error.message)) {
        toast.error("Those dates are already booked at this site. Please choose different dates.");
      } else {
        toast.error("We couldn't save your booking. Please try again.");
      }
      return;
    }


    setConfirmed(inserted ? { id: inserted.id, created_at: inserted.created_at } : null);
    toast.success("Payment received and booking requested");
    setDirection(1);
    setStep(5);
  };



  const handleReset = () => {
    setDirection(-1);
    setStep(1);
    setDateRange({ from: new Date(), to: undefined });
    setLocation("");
    setGuests("");
    setName("");
    setPhone("");
    setEmail("");
    setPostcode("");
    setAgreed(false);
    setPaymentName("");
    setPaymentCard("");
    setPaymentExpiry("");
    setPaymentCvc("");
    setConfirmed(null);
    setEditStay(false);
    setEditContact(false);

  };

  const getLocationLabel = (value: string) => {
    const loc = locations.find(l => l.id === value);
    return loc?.name || value;
  };

  const selectedLocation = locations.find(l => l.id === location);
  const nightlyPrice = selectedLocation?.price ?? 0;
  const nightsSelected =
    dateRange?.from && dateRange?.to
      ? Math.max(
        1,
        Math.ceil(
          (startOfDay(dateRange.to).getTime() - startOfDay(dateRange.from).getTime()) /
          (1000 * 60 * 60 * 24)
        )
      )
      : 0;
  const totalPrice = nightlyPrice * nightsSelected;
  const nightList =
    dateRange?.from && nightsSelected > 0
      ? Array.from({ length: nightsSelected }, (_, i) => addDays(startOfDay(dateRange.from!), i))
      : [];



  const formatDateRange = () => {
    if (!dateRange?.from) return "";
    if (!dateRange?.to) return format(dateRange.from, "MMM d, yyyy");
    return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  };

  return (
    <section id="booking" className="bg-background py-24 md:py-32 lg:py-36" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <span className="mb-4 block text-[11px] font-normal uppercase tracking-wider text-muted-foreground">
            Reservations
          </span>
          <h2 className="text-3xl font-light leading-tight tracking-tight text-foreground md:text-5xl">
            Choose the dates. We will handle the quiet.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm font-light leading-7 text-muted-foreground">
            Build your stay in a few calm steps. Pick a retreat, check availability, add guest details,
            and save the request to your Wild Haven account.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto max-w-6xl"
        >
          <Card className="grid overflow-hidden rounded-lg border border-border bg-card p-0 shadow-hover lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative min-h-[360px] bg-foreground text-background lg:min-h-full">
              <img
                src={selectedLocation?.image ?? locations[0]?.image}
                alt={selectedLocation?.name ?? "Wild Haven retreat"}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
              <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-between p-6 md:p-8">
                <div className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-normal uppercase tracking-wider text-white/80 backdrop-blur">
                  {step === 5 ? "Request saved" : `Step ${step} of 5`}
                </div>

                <div>
                  <p className="mb-3 text-[11px] font-normal uppercase tracking-wider text-white/55">
                    {selectedLocation ? "Selected retreat" : "Start with a retreat"}
                  </p>
                  <h3 className="text-3xl font-light tracking-tight">
                    {selectedLocation?.name ?? "Find your off-grid basecamp"}
                  </h3>
                  <p className="mt-3 flex items-center gap-2 text-sm font-light text-white/75">
                    <MapPin className="h-4 w-4" />
                    {selectedLocation?.location ?? "Forest, lake, meadow, canyon, river, or summit"}
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 text-sm font-light">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-white/45">Dates</span>
                      <span className="mt-1 block text-white">{formatDateRange() || "Not selected"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-white/45">Guests</span>
                      <span className="mt-1 block text-white">{guests || "Not selected"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-white/45">Nights</span>
                      <span className="mt-1 block text-white">{nightsSelected || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-white/45">Estimate</span>
                      <span className="mt-1 block text-white">${totalPrice || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden p-6 md:p-8 lg:p-10">
              <div className="mb-8 grid grid-cols-5 gap-2">
                {["Stay", "Guest", "Review", "Pay", "Done"].map((label, index) => {
                  const s = index + 1;
                  return (
                    <div key={label}>
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? "bg-primary" : "bg-border"
                          }`}
                      />
                      <p
                        className={`mt-2 text-[10px] font-normal uppercase tracking-wider ${s === step ? "text-foreground" : "text-muted-foreground"
                          }`}
                      >
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence mode="wait" custom={direction}>
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
                      <div className="space-y-5">
                        <div className="rounded-lg border border-border bg-background p-5">
                          <Label htmlFor="location" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                            <MapPin className="h-3 w-3" />
                            Location
                          </Label>
                          <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger id="location" className="h-12 rounded-md bg-card text-sm font-light">
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((loc) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                  {loc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="rounded-lg border border-border bg-background p-5">
                          <Label htmlFor="guests" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                            <Users className="h-3 w-3" />
                            Guests
                          </Label>
                          <Select value={guests} onValueChange={setGuests}>
                            <SelectTrigger id="guests" className="h-12 rounded-md bg-card text-sm font-light">
                              <SelectValue placeholder="Select guests" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Guest</SelectItem>
                              <SelectItem value="2">2 Guests</SelectItem>
                              <SelectItem value="3">3 Guests</SelectItem>
                              <SelectItem value="4">4 Guests</SelectItem>
                              <SelectItem value="5">5+ Guests</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="rounded-lg bg-accent/40 p-5">
                          <p className="text-[11px] font-normal uppercase tracking-wider text-muted-foreground">
                            Stay estimate
                          </p>
                          <div className="mt-4 flex items-end justify-between gap-4">
                            <div>
                              <p className="text-3xl font-light text-foreground">${totalPrice || 0}</p>
                              <p className="mt-1 text-xs font-light text-muted-foreground">
                                {nightsSelected > 0
                                  ? `${nightsSelected} ${nightsSelected === 1 ? "night" : "nights"} at $${nightlyPrice}/night`
                                  : "Select dates for pricing"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Button
                            size="default"
                            className="h-12 w-full rounded-md bg-foreground text-[11px] font-normal uppercase tracking-wider text-background smooth-hover hover:bg-primary hover:text-primary-foreground"
                            onClick={handleStep1Continue}
                          >
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border bg-background p-5">
                        <Label className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                          <CalendarDays className="h-3 w-3" />
                          Check-in & Check-out
                        </Label>
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={handleSelectRange}
                          numberOfMonths={1}
                          className="mx-auto rounded-md border border-border bg-card shadow-soft text-sm pointer-events-auto"
                          disabled={(date) => date < startOfDay(new Date()) || isUnavailable(date)}
                          modifiers={{ unavailable: (date) => isUnavailable(date) }}
                          modifiersClassNames={{
                            unavailable:
                              "line-through text-muted-foreground/60 bg-muted/60 rounded-none",
                          }}
                        />
                        <div className="mt-3 space-y-1 text-center">
                          {!location && (
                            <p className="text-xs text-muted-foreground font-light">
                              Select a location to see availability
                            </p>
                          )}
                          {location && loadingAvailability && (
                            <p className="text-xs text-muted-foreground font-light">
                              Checking availability…
                            </p>
                          )}
                          {location && !loadingAvailability && (
                            <p className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-normal">
                              <span className="inline-block h-3 w-3 rounded-sm bg-muted border border-border" />
                              {bookedRanges.length > 0 ? "Booked / unavailable" : "All dates available"}
                            </p>
                          )}
                          {dateRange?.from && dateRange?.to && (
                            <p className="text-xs text-muted-foreground font-light">
                              {nightsSelected} {nightsSelected === 1 ? "night" : "nights"} selected
                            </p>
                          )}
                        </div>

                        {location && nightsSelected > 0 && (
                          <div className="mt-4 rounded-md border border-border bg-card p-4 space-y-2">
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-normal">
                              Price estimate
                            </p>
                            <div className="flex items-baseline justify-between text-sm font-light text-foreground">
                              <span className="text-muted-foreground">
                                ${nightlyPrice} × {nightsSelected} {nightsSelected === 1 ? "night" : "nights"}
                              </span>
                              <span>${totalPrice}</span>
                            </div>
                            <div className="flex items-baseline justify-between border-t border-border pt-2 text-foreground">
                              <span className="text-[11px] uppercase tracking-wider font-normal">Total</span>
                              <span className="text-lg font-light">${totalPrice}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-light">
                              Estimate only — taxes and fees confirmed by email.
                            </p>
                          </div>
                        )}


                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <p className="text-[11px] font-normal uppercase tracking-wider text-muted-foreground">
                          Guest details
                        </p>
                        <h3 className="mt-2 text-2xl font-light tracking-tight text-foreground">
                          Where should we send your confirmation?
                        </h3>
                      </div>

                      <div className="rounded-lg border border-border bg-background p-5">
                        <Label htmlFor="name" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                          <User className="h-3 w-3" />
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Smith"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-12 rounded-md bg-card text-sm font-light"
                        />
                      </div>

                      <div className="rounded-lg border border-border bg-background p-5">
                        <Label htmlFor="phone" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                          <Phone className="h-3 w-3" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+44 7700 900000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-12 rounded-md bg-card text-sm font-light"
                        />
                      </div>

                      <div className="rounded-lg border border-border bg-background p-5">
                        <Label htmlFor="email" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                          <Mail className="h-3 w-3" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 rounded-md bg-card text-sm font-light"
                        />
                      </div>

                      <div className="rounded-lg border border-border bg-background p-5">
                        <Label htmlFor="postcode" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                          <MapPinned className="h-3 w-3" />
                          Postcode
                        </Label>
                        <Input
                          id="postcode"
                          type="text"
                          placeholder="SW1A 1AA"
                          value={postcode}
                          onChange={(e) => setPostcode(e.target.value)}
                          className="h-12 rounded-md bg-card text-sm font-light"
                        />
                      </div>

                      <div className="flex gap-3 pt-3 md:col-span-2">
                        <Button
                          variant="outline"
                          size="default"
                          className="h-12 flex-1 rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                          onClick={handleStep2Back}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          size="default"
                          className="h-12 flex-1 rounded-md bg-foreground text-[11px] font-normal uppercase tracking-wider text-background smooth-hover hover:bg-primary hover:text-primary-foreground"
                          onClick={handleStep2Continue}
                        >
                          Review Booking
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>


                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="mx-auto max-w-3xl space-y-8">
                      <div className="text-center space-y-1">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Step 3 — Review
                        </span>
                        <h3 className="text-xl font-light text-foreground">Check your stay</h3>
                      </div>

                      {/* Stay details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-normal">Your stay</p>
                          <button
                            type="button"
                            onClick={() => setEditStay((v) => !v)}
                            className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-primary hover:opacity-70 transition-opacity"
                          >
                            <Pencil className="h-3 w-3" />
                            {editStay ? "Done" : "Edit"}
                          </button>
                        </div>

                        {!editStay ? (
                          <div className="rounded-lg border border-border bg-background divide-y divide-border">
                            <div className="flex items-start justify-between gap-4 p-4">
                              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Campsite</span>
                              <span className="text-sm font-light text-foreground text-right">{getLocationLabel(location)}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4 p-4">
                              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Check-in</span>
                              <span className="text-sm font-light text-foreground text-right">
                                {dateRange?.from ? format(dateRange.from, "EEE d MMM yyyy") : "—"}
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-4 p-4">
                              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Check-out</span>
                              <span className="text-sm font-light text-foreground text-right">
                                {dateRange?.to ? format(dateRange.to, "EEE d MMM yyyy") : "—"}
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-4 p-4">
                              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Guests</span>
                              <span className="text-sm font-light text-foreground text-right">{guests}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-border bg-background p-5 space-y-4">
                            <div>
                              <Label className="flex items-center gap-1.5 mb-2 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                                <MapPin className="h-3 w-3" />
                                Campsite
                              </Label>
                              <Select value={location} onValueChange={setLocation}>
                                <SelectTrigger className="rounded-md text-sm font-light">
                                  <SelectValue placeholder="Choose a campsite" />
                                </SelectTrigger>
                                <SelectContent>
                                  {locations.map((loc) => (
                                    <SelectItem key={loc.id} value={loc.id}>
                                      {loc.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="flex items-center gap-1.5 mb-2 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                                <Users className="h-3 w-3" />
                                Guests
                              </Label>
                              <Select value={guests} onValueChange={setGuests}>
                                <SelectTrigger className="rounded-md text-sm font-light">
                                  <SelectValue placeholder="Number of guests" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 Guest</SelectItem>
                                  <SelectItem value="2">2 Guests</SelectItem>
                                  <SelectItem value="3">3 Guests</SelectItem>
                                  <SelectItem value="4">4 Guests</SelectItem>
                                  <SelectItem value="5">5+ Guests</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="flex items-center gap-1.5 mb-2 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                                <CalendarDays className="h-3 w-3" />
                                Check-in & Check-out
                              </Label>
                              <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={handleSelectRange}
                                numberOfMonths={1}
                                className="rounded-md border border-border shadow-soft text-sm pointer-events-auto"
                                disabled={(date) => date < startOfDay(new Date()) || isUnavailable(date)}
                                modifiers={{ unavailable: (date) => isUnavailable(date) }}
                                modifiersClassNames={{
                                  unavailable: "line-through text-muted-foreground/60 bg-muted/60 rounded-none",
                                }}
                              />
                              {location && loadingAvailability && (
                                <p className="mt-2 text-xs text-muted-foreground font-light text-center">
                                  Checking availability…
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contact details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-normal">Contact details</p>
                          <button
                            type="button"
                            onClick={() => setEditContact((v) => !v)}
                            className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-primary hover:opacity-70 transition-opacity"
                          >
                            <Pencil className="h-3 w-3" />
                            {editContact ? "Done" : "Edit"}
                          </button>
                        </div>

                        {!editContact ? (
                          <div className="rounded-md border border-border divide-y divide-border">
                            <div className="flex items-start justify-between gap-4 p-4">
                              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Lead guest</span>
                              <span className="text-sm font-light text-foreground text-right">
                                {name || "—"}
                                <span className="block text-xs text-muted-foreground">{email}</span>
                                <span className="block text-xs text-muted-foreground">{phone}</span>
                                {postcode && <span className="block text-xs text-muted-foreground">{postcode}</span>}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-md border border-border p-4 space-y-4">
                            <div>
                              <Label htmlFor="review-name" className="flex items-center gap-1.5 mb-2 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                                <User className="h-3 w-3" />
                                Full Name
                              </Label>
                              <Input id="review-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="rounded-md text-sm font-light" />
                            </div>
                            <div>
                              <Label htmlFor="review-phone" className="flex items-center gap-1.5 mb-2 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                                <Phone className="h-3 w-3" />
                                Phone Number
                              </Label>
                              <Input id="review-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-md text-sm font-light" />
                            </div>
                            <div>
                              <Label htmlFor="review-email" className="flex items-center gap-1.5 mb-2 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                                <Mail className="h-3 w-3" />
                                Email Address
                              </Label>
                              <Input id="review-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-md text-sm font-light" />
                            </div>
                            <div>
                              <Label htmlFor="review-postcode" className="flex items-center gap-1.5 mb-2 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                                <MapPinned className="h-3 w-3" />
                                Postcode
                              </Label>
                              <Input id="review-postcode" type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} className="rounded-md text-sm font-light" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Nights breakdown */}
                      <div className="rounded-lg border border-border bg-accent/35 p-5 space-y-3">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-normal">
                          Nights ({nightsSelected})
                        </p>
                        <ul className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {nightList.map((night) => (
                            <li
                              key={night.toISOString()}
                              className="flex items-baseline justify-between text-sm font-light text-foreground"
                            >
                              <span className="text-muted-foreground">{format(night, "EEE d MMM")}</span>
                              <span>${nightlyPrice}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-baseline justify-between border-t border-border pt-3 text-foreground">
                          <span className="text-[11px] uppercase tracking-wider font-normal">Total</span>
                          <span className="text-lg font-light">${totalPrice}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-light">
                          ${nightlyPrice} per night × {nightsSelected} {nightsSelected === 1 ? "night" : "nights"}. Taxes and fees confirmed by email.
                        </p>
                      </div>

                      {/* Cancellation policy */}
                      <div className="rounded-lg border border-border bg-background p-5 space-y-3">
                        <p className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-normal">
                          <ShieldCheck className="h-3 w-3" />
                          Cancellation policy
                        </p>
                        <ul className="space-y-2 text-xs text-muted-foreground font-light">
                          <li className="flex gap-2"><span className="text-primary">•</span> Free cancellation up to 14 days before check-in — full refund.</li>
                          <li className="flex gap-2"><span className="text-primary">•</span> Cancel 7–14 days before arrival and 50% of the total is refunded.</li>
                          <li className="flex gap-2"><span className="text-primary">•</span> Within 7 days of arrival the stay is non-refundable, but dates can be moved once.</li>
                          <li className="flex gap-2"><span className="text-primary">•</span> Check-in from 3pm, check-out by 11am. Quiet hours 10pm–7am.</li>
                        </ul>
                        <label className="flex items-start gap-3 pt-1 cursor-pointer">
                          <Checkbox
                            checked={agreed}
                            onCheckedChange={(v) => setAgreed(v === true)}
                            className="mt-0.5"
                          />
                          <span className="text-xs text-muted-foreground font-light">
                            I've read and accept the cancellation policy and site rules.
                          </span>
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="default"
                          className="h-12 flex-1 rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                          onClick={handleStep3Back}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          size="default"
                          disabled={submitting || !agreed}
                          className="h-12 flex-1 rounded-md bg-foreground text-[11px] font-normal uppercase tracking-wider text-background smooth-hover hover:bg-primary hover:text-primary-foreground"
                          onClick={handleStep3Continue}
                        >
                          Continue to Payment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="mx-auto max-w-3xl space-y-6">
                      <div className="text-center space-y-1">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Step 4 - Payment
                        </span>
                        <h3 className="text-xl font-light text-foreground">Pay before admin confirmation</h3>
                        <p className="mx-auto max-w-xl text-sm font-light text-muted-foreground">
                          Your booking request is sent to admin only after payment is completed.
                        </p>
                      </div>

                      <div className="grid gap-5 md:grid-cols-[1fr_0.8fr]">
                        <div className="rounded-lg border border-border bg-background p-5 space-y-4">
                          <p className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-normal">
                            <CreditCard className="h-3.5 w-3.5" />
                            Secure card payment
                          </p>
                          <div>
                            <Label htmlFor="payment-name" className="mb-2 block text-[11px] uppercase tracking-wider font-normal">
                              Name on card
                            </Label>
                            <Input
                              id="payment-name"
                              value={paymentName}
                              onChange={(e) => setPaymentName(e.target.value)}
                              className="h-12 rounded-md bg-card text-sm font-light"
                            />
                          </div>
                          <div>
                            <Label htmlFor="payment-card" className="mb-2 block text-[11px] uppercase tracking-wider font-normal">
                              Card number
                            </Label>
                            <Input
                              id="payment-card"
                              inputMode="numeric"
                              placeholder="4242 4242 4242 4242"
                              value={paymentCard}
                              onChange={(e) => setPaymentCard(formatCardNumber(e.target.value))}
                              maxLength={19}
                              className="h-12 rounded-md bg-card text-sm font-light"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="payment-expiry" className="mb-2 block text-[11px] uppercase tracking-wider font-normal">
                                Expiry
                              </Label>
                              <Input
                                id="payment-expiry"
                                placeholder="MM/YY"
                                value={paymentExpiry}
                                onChange={(e) => setPaymentExpiry(formatExpiry(e.target.value))}
                                maxLength={5}
                                className="h-12 rounded-md bg-card text-sm font-light"
                              />
                            </div>
                            <div>
                              <Label htmlFor="payment-cvc" className="mb-2 block text-[11px] uppercase tracking-wider font-normal">
                                CVC
                              </Label>
                              <Input
                                id="payment-cvc"
                                inputMode="numeric"
                                placeholder="123"
                                value={paymentCvc}
                                onChange={(e) => setPaymentCvc(e.target.value)}
                                className="h-12 rounded-md bg-card text-sm font-light"
                              />
                            </div>
                          </div>
                          <p className="flex items-center gap-2 text-xs font-light text-muted-foreground">
                            <LockKeyhole className="h-3.5 w-3.5" />
                            Demo gateway: use test details only. Add live Stripe or PayPal keys before taking real payments.
                          </p>
                        </div>

                        <div className="rounded-lg border border-border bg-accent/35 p-5 space-y-4">
                          <p className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-normal">
                            <ReceiptText className="h-3.5 w-3.5" />
                            Payment summary
                          </p>
                          <div className="space-y-3 text-sm font-light">
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">{getLocationLabel(location)}</span>
                              <span>${nightlyPrice}/night</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">{nightsSelected} nights</span>
                              <span>${totalPrice}</span>
                            </div>
                            <div className="flex justify-between gap-4 border-t border-border pt-3 text-foreground">
                              <span className="text-[11px] uppercase tracking-wider font-normal">Total due</span>
                              <span className="text-xl font-light">${totalPrice}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="rounded-full border-green-200 bg-green-100 px-3 py-1 text-[10px] uppercase tracking-wider text-green-800">
                            Payment required before confirmation
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="default"
                          className="h-12 flex-1 rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                          onClick={handlePaymentBack}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          size="default"
                          disabled={submitting}
                          className="h-12 flex-1 rounded-md bg-foreground text-[11px] font-normal uppercase tracking-wider text-background smooth-hover hover:bg-primary hover:text-primary-foreground"
                          onClick={handleConfirm}
                        >
                          {submitting ? "Processing..." : user ? `Pay $${totalPrice} & Book` : "Sign In & Pay"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div
                    key="step5"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="text-center py-8 space-y-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                      </motion.div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-light text-foreground">Payment received</h3>
                        <p className="text-sm text-muted-foreground font-light">
                          Thank you, {name}! Your paid booking request has been sent to admin.
                        </p>
                      </div>

                      <div className="bg-accent/30 rounded-md p-4 max-w-sm mx-auto text-left space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Booking Summary</p>
                        <div className="text-sm font-light text-foreground space-y-1">
                          <p><span className="text-muted-foreground">Location:</span> {getLocationLabel(location)}</p>
                          <p><span className="text-muted-foreground">Dates:</span> {formatDateRange()}</p>
                          <p><span className="text-muted-foreground">Guests:</span> {guests}</p>
                          <p><span className="text-muted-foreground">Total:</span> ${totalPrice}</p>
                          <p><span className="text-muted-foreground">Payment:</span> Paid</p>
                          <p><span className="text-muted-foreground">Email:</span> {email}</p>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground font-light">
                        Your request is saved to your account — we'll confirm by email to {email}
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                        <Button
                          size="default"
                          className="rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                          onClick={() =>
                            dateRange?.from &&
                            dateRange?.to &&
                            generateReceiptPdf({
                              reference: (confirmed?.id ?? "").slice(0, 8).toUpperCase() || "PENDING",
                              locationId: location,
                              checkIn: format(dateRange.from, "yyyy-MM-dd"),
                              checkOut: format(dateRange.to, "yyyy-MM-dd"),
                              guests: parseInt(guests, 10) || 1,
                              guestName: name,
                              email,
                              phone,
                              totalPrice: totalPrice,
                              status: "pending",
                              issuedAt: confirmed?.created_at,
                            })
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Receipt
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          className="rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                          onClick={() => {
                            if (!dateRange?.from || !dateRange?.to) return;
                            const opened = printReceipt({
                              reference: (confirmed?.id ?? "").slice(0, 8).toUpperCase() || "PENDING",
                              locationId: location,
                              checkIn: format(dateRange.from, "yyyy-MM-dd"),
                              checkOut: format(dateRange.to, "yyyy-MM-dd"),
                              guests: parseInt(guests, 10) || 1,
                              guestName: name,
                              email,
                              phone,
                              totalPrice: totalPrice,
                              status: "pending",
                              issuedAt: confirmed?.created_at,
                            });
                            if (!opened) {
                              toast.error("Pop-up blocked", {
                                description: "Allow pop-ups to open the printer-friendly receipt.",
                              });
                            }
                          }}
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Print Receipt
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          className="rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                          onClick={() => navigate("/account")}
                        >
                          View Bookings
                        </Button>

                        <Button
                          variant="outline"
                          size="default"
                          className="rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                          onClick={handleReset}
                        >
                          Book Another Stay
                        </Button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Booking;
