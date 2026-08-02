# 🌲 Wild Haven - Off-Grid Retreat Booking

Wild Haven is a modern retreat booking web app for discovering and reserving off-grid campsites. Guests can browse scenic stays, check date availability, create an account, submit booking requests, manage reservations, and download or print receipts. Admin users can monitor bookings, filter reservations by location and timeframe, and update booking statuses.

## ✨ Highlights

- 🏕️ Beautiful off-grid retreat landing page with animated sections
- 📍 Campsite listing and detail pages with photos, amenities, reviews, and pricing
- 📅 Multi-step booking flow with date-range selection and unavailable-date blocking
- 🔐 Supabase email/password authentication
- 👤 Guest account area for profile details and booking management
- 🧾 PDF receipt download and printer-friendly receipt view
- 🛠️ Admin dashboard for reservations, revenue estimates, and booking status changes
- 🧪 Demo admin mode at `/admin?demo=true`
- 📱 Responsive UI built with Tailwind CSS and shadcn/Radix components

## 🧭 App Routes

| Route | Purpose |
| --- | --- |
| `/` | Home page with hero, experience sections, featured locations, and booking form |
| `/locations` | Full campsite catalog |
| `/location/:id` | Detailed campsite page |
| `/about` | Brand/story page |
| `/contact` | Contact page |
| `/auth` | Sign in and sign up page |
| `/account` | Guest dashboard for bookings and profile details |
| `/admin` | Protected admin dashboard |
| `/admin?demo=true` | Demo dashboard using mock booking data |

## 🧰 Tech Stack

- ⚡ Vite
- ⚛️ React 18
- 🟦 TypeScript
- 🎨 Tailwind CSS
- 🧩 shadcn/ui + Radix UI
- 🌀 Framer Motion
- 🗺️ React Router
- 🔄 TanStack Query
- 🛡️ Supabase Auth, Database, RPC, and Row Level Security
- 📄 jsPDF for downloadable receipts
- ✅ Zod and React Hook Form tooling
- 🧹 ESLint

## 📦 Main Features

### 🏕️ Retreat Discovery

The app includes several retreat locations such as Forest Haven, Lakeside Retreat, Meadow Vista, Canyon Ridge, River Bend, and Summit Peak. Each location includes:

- Name and region
- Nightly price
- Star rating
- Feature tags
- Amenity icons
- Photo gallery
- Detailed stay information
- Guest reviews

Location data is currently stored in [`src/data/locations.ts`](src/data/locations.ts).

### 📅 Booking Flow

The booking form guides guests through:

1. Selecting a campsite, guest count, check-in date, and check-out date
2. Entering contact details
3. Reviewing the stay, price breakdown, cancellation policy, and site rules
4. Confirming the booking after sign-in
5. Downloading or printing a receipt

Availability is checked with the Supabase RPC function `get_booked_ranges`. Existing non-cancelled bookings are disabled in the calendar, and the database also prevents overlapping bookings with an exclusion constraint.

### 🔐 Authentication

Guests can create an account or sign in with Supabase email/password auth. New users automatically get a profile row through a database trigger.

After sign-in, guests can:

- View upcoming bookings
- View past or cancelled bookings
- Cancel active bookings
- Save profile details
- Download and print receipts

### 🛠️ Admin Dashboard

The admin dashboard provides:

- Total bookings
- Upcoming booking count
- Pending booking count
- Estimated revenue
- Location filters
- Upcoming/past filters
- Guest contact details
- Confirm and cancel actions

Admin access is controlled through the `user_roles` table and the `admin` role.

## 🗂️ Project Structure

```text
.
|-- public/                    # Static public assets
|-- src/
|   |-- assets/                # Retreat and detail images
|   |-- components/            # Shared app components
|   |-- components/ui/         # shadcn/Radix UI primitives
|   |-- data/                  # Static location and mock booking data
|   |-- hooks/                 # Auth, mobile, and toast hooks
|   |-- integrations/
|   |   `-- supabase/          # Supabase client and generated types
|   |-- lib/                   # Utilities and receipt generation
|   |-- pages/                 # Route-level pages
|   |-- App.tsx                # Router and app providers
|   `-- main.tsx               # React entry point
|-- supabase/
|   |-- config.toml            # Supabase local/project config
|   `-- migrations/            # Database schema and security migrations
|-- package.json               # Scripts and dependencies
|-- tailwind.config.ts         # Tailwind theme configuration
|-- vite.config.ts             # Vite configuration
`-- README.md
```

## 🚀 Getting Started

### 1. Clone the project

```bash
git clone <your-repository-url>
cd "Remix of Off-Grid Retreat Booking"
```

### 2. Install dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

Do not commit private service-role keys or production secrets.

### 4. Set up Supabase

Create a Supabase project, then apply the migrations from the `supabase/migrations` folder.

The migrations create:

- `profiles` table
- `bookings` table
- `user_roles` table
- `app_role` enum
- `booking_status` enum
- Row Level Security policies
- User profile creation trigger
- Booking validation trigger
- No-overlap booking constraint
- `get_booked_ranges` availability RPC

If you are using the Supabase CLI, link your project and push migrations:

```bash
supabase link --project-ref your-project-id
supabase db push
```

### 5. Run the development server

```bash
npm run dev
```

Open the local URL printed in your terminal, usually:

```text
http://localhost:5173
```

## 🧑‍💼 Creating an Admin User

After a user signs up, add an admin role for that user in Supabase SQL:

```sql
insert into public.user_roles (user_id, role)
values ('USER_UUID_HERE', 'admin');
```

Then visit:

```text
/admin
```

For a preview without database admin permissions, visit:

```text
/admin?demo=true
```

## 🧾 Receipts

Receipt generation lives in [`src/lib/receipt.ts`](src/lib/receipt.ts).

Guests can:

- Download a PDF receipt powered by `jsPDF`
- Open a printer-friendly receipt page
- Re-download or print receipts from their account page

Receipt data includes:

- Booking reference
- Campsite name
- Check-in and check-out dates
- Guest count
- Guest details
- Booking status
- Nightly breakdown
- Total price
- Cancellation policy

## 🧪 Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates a production build in `dist/`.

```bash
npm run build:dev
```

Creates a development-mode build.

```bash
npm run preview
```

Serves the production build locally.

```bash
npm run lint
```

Runs ESLint across the project.

## 🔒 Database Security Notes

The Supabase migrations enable Row Level Security for sensitive tables.

Current access model:

- Authenticated users can view and update their own profile
- Authenticated users can create their own bookings
- Authenticated users can view and update their own bookings
- Admin users can view and update bookings across users
- Public availability lookup is exposed through `get_booked_ranges`
- Overlapping active bookings are prevented at the database level

Cancelled bookings do not block future availability.

## 🎨 Styling

The interface uses:

- Tailwind utility classes
- A custom theme in `tailwind.config.ts`
- shadcn/Radix UI components
- Lucide icons
- Framer Motion page and section animations

The visual direction is calm, lightweight, and nature-focused, with soft spacing, muted surfaces, and campsite imagery.

## 📸 Assets

Retreat images are stored in:

```text
src/assets/
```

These assets power the hero, location cards, and detail galleries.

## 🚢 Deployment

Build the app:

```bash
npm run build
```

Deploy the generated `dist/` folder to any static hosting provider such as:

- Vercel
- Netlify
- Cloudflare Pages
- Supabase Hosting-compatible static deployment
- Any static file server

Make sure your production environment includes:

```env
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Also configure Supabase Auth redirect URLs for your deployed domain.

## 🧯 Troubleshooting

### Supabase requests fail

Check that `.env` contains the correct Supabase URL and publishable key. Restart the dev server after changing environment variables.

### Sign-up works but users cannot book

Confirm that email verification settings match your development workflow. If email confirmation is required, users must verify before creating authenticated bookings.

### Admin page only shows personal bookings

Add the user to `public.user_roles` with the `admin` role.

### Date ranges still look available after booking

Make sure the `get_booked_ranges` migration has been applied and the booking status is not `cancelled`.

### Overlapping bookings are inserted

Confirm the `btree_gist` extension and `bookings_no_overlap` constraint migration were applied successfully.

## 🌿 Future Improvements

- Payment integration
- Email booking confirmations
- Admin calendar view
- Dynamic location management
- Guest messaging
- Search and filters for amenities, price, and region
- Real image uploads through Supabase Storage
- Automated tests for booking and auth flows

## 📄 License

This project is private by default. Add a license file if you plan to publish or distribute it.

---

Made with calm trails, clean code, and a little campfire energy. 🔥
