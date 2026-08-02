import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-day-picker";
import { format, addDays, startOfDay } from "date-fns";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import { CalendarDays, Users, MapPin, ArrowRight, ArrowLeft, CheckCircle, User, Phone, Mail, MapPinned, ShieldCheck, Download, Printer, Pencil } from "lucide-react";
import { locations } from "@/data/locations";
import { generateReceiptPdf, printReceipt } from "@/lib/receipt";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const DRAFT_KEY = "wh_booking_draft";


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
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const activeSession = sessionData.session;

    if (sessionError || !activeSession?.user) {
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
        user_id: activeSession.user.id,
        location_id: location,
        check_in: format(dateRange.from, "yyyy-MM-dd"),
        check_out: format(dateRange.to, "yyyy-MM-dd"),
        guests: parseInt(guests, 10) || 1,
        guest_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        postcode: postcode.trim(),
        total_price: nights * nightlyRate,
      })
      .select("id, created_at")
      .single();
    setSubmitting(false);


    if (error) {
      if (error.code === "23P01" || /bookings_no_overlap/.test(error.message)) {
        toast.error("Those dates are already booked at this site. Please choose different dates.");
      } else {
        toast.error("We couldn't save your booking. Please try again.");
      }
      return;
    }


    setConfirmed(inserted ? { id: inserted.id, created_at: inserted.created_at } : null);
    toast.success("Booking requested");
    setDirection(1);
    setStep(4);
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
    setConfirmed(null);
    setEditStay(false);
    setEditContact(false);

  };

  const getLocationLabel = (value: string) => {
    const loc = locations.find(l => l.id === value);
    return loc?.name || value;
  };

  const nightlyPrice = locations.find(l => l.id === location)?.price ?? 0;
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
    <section id="booking" className="py-32 lg:py-40 bg-accent/20" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">
            Reservations
          </span>
          <h2 className="text-2xl md:text-3xl font-light mb-4 text-foreground tracking-tight">
            Book Your Escape
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto font-light">
            Choose your dates and let nature work its magic
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="p-8 lg:p-10 shadow-soft border border-border bg-card overflow-hidden">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? "w-8 bg-primary" : s < step ? "w-4 bg-primary/50" : "w-4 bg-border"
                  }`}
                />
              ))}
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
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="location" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                          <MapPin className="h-3 w-3" />
                          Location
                        </Label>
                        <Select value={location} onValueChange={setLocation}>
                          <SelectTrigger id="location" className="rounded-md text-sm font-light">
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

                      <div>
                        <Label htmlFor="guests" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                          <Users className="h-3 w-3" />
                          Guests
                        </Label>
                        <Select value={guests} onValueChange={setGuests}>
                          <SelectTrigger id="guests" className="rounded-md text-sm font-light">
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

                      <div className="pt-4">
                        <Button
                          size="default"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                          onClick={handleStep1Continue}
                        >
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                        <CalendarDays className="h-3 w-3" />
                        Check-in & Check-out
                      </Label>
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={handleSelectRange}
                        numberOfMonths={1}
                        className="rounded-md border-border shadow-soft text-sm pointer-events-auto"
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
                        <div className="mt-4 rounded-md border border-border bg-accent/30 p-4 space-y-2">
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
                  <div className="space-y-6 max-w-md mx-auto">
                    <div>
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
                        className="rounded-md text-sm font-light"
                      />
                    </div>

                    <div>
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
                        className="rounded-md text-sm font-light"
                      />
                    </div>

                    <div>
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
                        className="rounded-md text-sm font-light"
                      />
                    </div>

                    <div>
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
                        className="rounded-md text-sm font-light"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        size="default"
                        className="flex-1 rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                        onClick={handleStep2Back}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        size="default"
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
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
                  <div className="max-w-lg mx-auto space-y-8">
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
                        <div className="rounded-md border border-border divide-y divide-border">
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
                        <div className="rounded-md border border-border p-4 space-y-4">
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
                    <div className="rounded-md border border-border bg-accent/30 p-4 space-y-3">
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
                    <div className="rounded-md border border-border p-4 space-y-3">
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
                        className="flex-1 rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                        onClick={handleStep3Back}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        size="default"
                        disabled={submitting || !agreed}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                        onClick={handleConfirm}
                      >
                        {submitting ? "Saving..." : user ? "Confirm Booking" : "Sign In & Book"}
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
                  <div className="text-center py-8 space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                    </motion.div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-light text-foreground">Booking Confirmed</h3>
                      <p className="text-sm text-muted-foreground font-light">
                        Thank you, {name}! Your reservation has been submitted.
                      </p>
                    </div>

                    <div className="bg-accent/30 rounded-md p-4 max-w-sm mx-auto text-left space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Booking Summary</p>
                      <div className="text-sm font-light text-foreground space-y-1">
                        <p><span className="text-muted-foreground">Location:</span> {getLocationLabel(location)}</p>
                        <p><span className="text-muted-foreground">Dates:</span> {formatDateRange()}</p>
                        <p><span className="text-muted-foreground">Guests:</span> {guests}</p>
                        <p><span className="text-muted-foreground">Total:</span> ${totalPrice}</p>
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
                        View My Bookings
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
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Booking;
