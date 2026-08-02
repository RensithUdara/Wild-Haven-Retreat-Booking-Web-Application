CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    location_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  )
  WHERE (status <> 'cancelled'::booking_status);