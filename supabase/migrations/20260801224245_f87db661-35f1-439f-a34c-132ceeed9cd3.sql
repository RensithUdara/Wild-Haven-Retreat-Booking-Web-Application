CREATE OR REPLACE FUNCTION public.get_booked_ranges(_location_id text)
RETURNS TABLE (check_in date, check_out date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.check_in, b.check_out
  FROM public.bookings b
  WHERE b.location_id = _location_id
    AND b.status <> 'cancelled'::booking_status
    AND b.check_out >= CURRENT_DATE
$$;

REVOKE ALL ON FUNCTION public.get_booked_ranges(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booked_ranges(text) TO anon, authenticated, service_role;