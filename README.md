# 🌲 Wild Haven - Off-Grid Retreat Booking

Wild Haven is a modern retreat booking web application for discovering, reserving, and managing off-grid campsite stays. Guests can browse retreats, check date availability, sign in, pay through a demo payment step, submit booking requests, manage reservations, and download or print receipts. Admin users get a focused operations dashboard for reviewing paid bookings, contacting guests, exporting reservations, and confirming or cancelling stays.

🌐 Live site: https://wild-haven-booking.vercel.app

🛠️ Admin route: https://wild-haven-booking.vercel.app/admin

🧪 Demo admin route: https://wild-haven-booking.vercel.app/admin?demo=true

## ✨ Features

- 📱 Responsive public website with landing, about, contact, locations, and detail pages
- 🏕️ Campsite catalog with photos, amenities, reviews, pricing, and guest capacity details
- 📅 Multi-step booking flow: stay details, guest details, review, payment, and receipt
- 🔎 Availability calendar powered by Supabase RPC and database overlap protection
- 🔐 Supabase email/password authentication
- 👤 Guest account dashboard for bookings, profile details, cancellation, and receipts
- 💳 Demo payment gateway screen before booking submission
- ⌨️ Auto-formatting payment inputs for card number and expiry date
- 🛠️ Admin dashboard with search, location filters, status filters, payment status, and CSV export
- ✅ Admin confirmation is blocked until a booking is marked paid
- 🧾 PDF receipt download and printer-friendly receipt view
- 🚀 Vercel deployment with SPA route rewrites for direct links such as `/admin`

## 💳 Important Payment Note

The current payment step is a demo gateway UI. It validates and formats test card details, then stores a paid marker in the booking `notes` field so admin users can confirm the request.

It does not charge real cards.

For production payments, add a real provider such as Stripe or PayPal using a secure backend or serverless function. Do not process or store raw card details in the browser or database.

## 🧭 App Routes

| Route | Purpose |
| --- | --- |
| `/` | Home page with hero, experience sections, featured locations, and booking form |
| `/locations` | Full campsite catalog |
| `/location/:id` | Detailed campsite page |
| `/about` | Brand and story page |
| `/contact` | Contact page |
| `/auth` | Sign in and sign up page |
| `/account` | Guest dashboard for bookings, receipts, and profile details |
| `/admin` | Protected admin dashboard |
| `/admin?demo=true` | Admin preview using mock booking data |

## 🧰 Tech Stack

- ⚡ Vite
- ⚛️ React 18
- 🟦 TypeScript
- 🎨 Tailwind CSS
- 🧩 shadcn/ui and Radix UI
- 🎞️ Framer Motion
- 🗺️ React Router
- 🔄 TanStack Query
- 🛡️ Supabase Auth, Database, RPC, and Row Level Security
- 📄 jsPDF
- 🎯 Lucide React icons
- 🧹 ESLint

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
|-- vercel.json                # Vercel SPA rewrite configuration
|-- package.json               # Scripts and dependencies
|-- tailwind.config.ts         # Tailwind theme configuration
|-- vite.config.ts             # Vite configuration
`-- README.md
```

## 🚀 Getting Started

### 1. 📦 Install Dependencies

```bash
npm install
```

### 2. 🔧 Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

Only use Supabase publishable keys in the frontend. Do not commit service-role keys or payment provider secrets.

### 3. 🛡️ Set Up Supabase

Create a Supabase project, then apply the migrations from `supabase/migrations`.

The migrations create:

- 🧑 `profiles` table
- 📅 `bookings` table
- 🛠️ `user_roles` table
- 🏷️ `app_role` enum
- 🏷️ `booking_status` enum
- 🔒 Row Level Security policies
- 👤 Automatic profile creation trigger
- ✅ Booking date validation trigger
- 🚫 No-overlap booking constraint
- 🔎 `get_booked_ranges` availability RPC

Using the Supabase CLI:

```bash
supabase link --project-ref your-project-id
supabase db push
```

### 4. 💻 Run Locally

```bash
npm run dev
```

The Vite config uses port `8080`, so the local app usually runs at:

```text
http://localhost:8080
```

## 📅 Booking Flow

Guests complete the booking form in five steps:

1. 🏕️ Select campsite, guest count, check-in date, and check-out date
2. 👤 Enter guest contact details
3. 🧾 Review stay details, price breakdown, cancellation policy, and site rules
4. 💳 Complete the demo payment step
5. ✅ View success state and download or print a receipt

Availability is checked through the Supabase `get_booked_ranges` RPC. Existing non-cancelled bookings are disabled in the calendar, and the database also prevents overlapping active bookings.

## 🛠️ Admin Dashboard

The admin page includes:

- 🧭 Compact operations header
- 🔍 Booking search
- 📍 Location tabs
- 📆 Upcoming and past filters
- 🏷️ Status filters
- 💳 Payment status badges
- 📤 CSV export
- 📊 Revenue and booking stats
- ✉️ Guest email and phone links
- ✅ Confirm and cancel actions

Admin confirmation requires payment. Bookings without the `PAYMENT_STATUS=paid` marker are shown as unpaid and cannot be confirmed from the admin table.

## 👤 Creating an Admin User

After a user signs up, add the admin role in Supabase SQL:

```sql
insert into public.user_roles (user_id, role)
values ('USER_UUID_HERE', 'admin');
```

Then visit:

```text
/admin
```

For a preview without database admin permissions:

```text
/admin?demo=true
```

## 🧾 Receipts

Receipt generation lives in `src/lib/receipt.ts`.

Guests can:

- 📄 Download a PDF receipt
- 🖨️ Open a printer-friendly receipt
- 🔁 Re-download or print receipts from the account page

Receipt data includes booking reference, campsite name, dates, guest count, contact details, status, nightly breakdown, total price, and policy text.

## 🧪 Scripts

```bash
npm run dev
```

Starts the local Vite development server.

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

## 🚢 Deployment

The app is deployed on Vercel:

```text
https://wild-haven-booking.vercel.app
```

`vercel.json` rewrites all routes to `index.html`, which keeps React Router routes working on refresh and direct navigation.

Production environment variables required on Vercel:

```env
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Also configure Supabase Auth redirect URLs for the deployed domain.

## 🔒 Security Notes

- 🛡️ Row Level Security is enabled for sensitive Supabase tables
- 👤 Authenticated users can view and update their own profile
- 📅 Authenticated users can create, view, update, and cancel their own bookings
- 🛠️ Admin users can view and update bookings across users
- 🔎 Public availability lookup is handled through `get_booked_ranges`
- ♻️ Cancelled bookings do not block future availability
- 🔐 Real payment secrets must only be used server-side

## 🧯 Troubleshooting

### 🛡️ Supabase Requests Fail

Check that `.env` contains the correct Supabase URL and publishable key. Restart the dev server after changing environment variables.

### 👤 Users Cannot Book After Sign-Up

Check Supabase email confirmation settings. If confirmation is required, users must verify their email before creating authenticated bookings.

### 🛠️ Admin Page Shows Only Personal Bookings

Add the user to `public.user_roles` with the `admin` role.

### 🚦 Direct Vercel Routes Return 404

Confirm `vercel.json` exists and contains the SPA rewrite to `/index.html`.

### 📅 Overlapping Bookings Are Inserted

Confirm the `btree_gist` extension and `bookings_no_overlap` constraint migration were applied successfully.

## 🌿 Future Improvements

- 💳 Replace demo payment UI with Stripe Checkout or PayPal
- ✅ Add server-side payment verification
- ✉️ Send automatic email confirmations
- 📆 Add admin calendar view
- 🏕️ Add dynamic location management
- 💬 Add guest messaging
- 🔎 Add search and filters for amenities, price, and region
- 🖼️ Store uploaded images in Supabase Storage
- 🧪 Add automated tests for booking, auth, and admin flows

## 📄 License

This project is private by default. Add a license file before publishing or distributing it.
