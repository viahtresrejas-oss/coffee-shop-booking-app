# Coffee Shop Table Booking App

An Expo (SDK 57) / React Native app for browsing cafes and booking tables at a
coffee shop — built for **Laboratory Exercise 05: offline-first persistence and
CRUD with `expo-sqlite`**.

## Features

- **Offline-first cafe directory** — cafes are stored in SQLite (seeded on first
  launch), read with parameterized `LIKE` search and `category = ?` filters on
  Home and Explore.
- **Booking CRUD** — create (Confirm Booking), update (Reschedule, with
  confirmation picker), and delete (Cancel, with confirmation dialog) bookings;
  all rows persist across app restarts.
- **Profile persistence** — name, email, phone, and avatar URI are stored in a
  single SQLite `profile` row (avatar image survives restarts).
- **Legacy migration** — one-time migration copies any bookings saved in
  `AsyncStorage` by earlier builds into SQLite.

## Database schema

| Table | Purpose |
| --- | --- |
| `cafes` | Read-only directory (name, category, location, rating, price range, image, seats) — mapped onto the lab's `products` table |
| `bookings` | Create / update / delete — plus UI helper label columns (best-effort `ALTER TABLE` migration for older installs) |
| `profile` | Single row (`id = 1`) with the user's profile |

All queries are parameterized and every helper is wrapped in try/catch so a DB
failure degrades to in-memory state instead of crashing the UI.

## Setup

```bash
npm install          # or: npm ci
npx expo start -c    # start the dev server with a cleared Metro cache
```

Scan the QR code with **Expo Go** (Android/iOS). SQLite is a bundled native
module in Expo Go, so no custom dev build is required for this project.

### Useful commands

```bash
npx expo lint        # ESLint (expo config)
npx expo-doctor      # diagnose dependency/config issues
npx expo install --fix
```

## Testing the lab requirements

1. Launch the app → Home and Explore list cafes from SQLite (kill/reopen Expo
   Go — data persists without network).
2. Search on Home/Explore → results filter via SQL `LIKE`.
3. Pick a category chip on Explore → SQL `AND category = ?` filter.
4. Book a table → row appears under Bookings after restart.
5. Reschedule → time slot updates in place; Cancel → confirmation dialog, then
   the row is deleted.
6. Change profile details / avatar → survives a full app restart.

## Project structure

```
App.js                     # providers + DB init
src/
  services/db.js           # SQLite schema, seeds, and all query helpers
  contexts/BookingContext.js  # booking CRUD (SQLite-backed, legacy migration)
  contexts/ProfileContext.js  # profile load/save (SQLite-backed)
  navigation/AppNavigator.js  # stack navigation
  screens/                 # Splash, Onboarding, Home, Explore, Details,
                            # BookTable, MyBookings, Profile
  components/              # AppHeader, CafeCard
  theme.js, theme/theme.js # shared styling tokens
```

## Notes

- Booking-create/reschedule/cancel fulfills the lab rubric's "Add / Edit /
  Delete item" requirement — mapped onto the domain (cafes are the read-only
  `products` listing). Confirm with your instructor if a literal "Add Cafe"
  form is required.