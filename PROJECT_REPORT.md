# Anime Collection — Project Report

---

## 1. Project Overview

**Anime Collection** is a personal anime tracking and display web application. It is not a multi-user platform — it is a single-person curated showcase of watched anime, with a password-protected admin interface for managing the collection.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript, React 19 |
| Database | Firebase Firestore |
| Image Storage | Cloudinary |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Theme | Custom ThemeProvider (theme-context.tsx) |
| Deployment | Vercel (recommended) |

---

## 3. Project Structure

```
├── app/
│   ├── page.tsx                  # Home page (main collection view)
│   ├── layout.tsx                # Root layout (nav, theme, footer)
│   ├── loading.tsx               # Global loading state
│   ├── globals.css               # Global styles + custom CSS classes
│   ├── admin/
│   │   ├── page.tsx              # Admin panel (600+ lines, CRUD operations)
│   │   └── manage-anime.tsx      # Empty file (logic lives in page.tsx)
│   └── language/
│       └── [lang]/
│           └── page.tsx          # Language-specific anime grid page
├── components/
│   ├── anime-card.tsx            # Individual anime card with hover effects
│   ├── anime-form.tsx            # Add anime form (Cloudinary + Firestore)
│   ├── loading-skeleton.tsx      # Skeleton loader component
│   ├── navigation.tsx            # Top nav bar (Home + Admin links)
│   ├── theme-provider.tsx        # Theme wrapper
│   ├── theme-toggle.tsx          # Dark/Light mode toggle button
│   └── ui/                       # shadcn/ui components (50 files)
├── contexts/
│   └── theme-context.tsx         # Custom dark/light theme context
├── hooks/
│   ├── use-mobile.tsx            # Mobile breakpoint hook
│   └── use-toast.ts              # Toast notification hook
├── lib/
│   ├── firebase.ts               # Firebase app + Firestore init
│   ├── cloudinary.ts             # Cloudinary image upload function
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
└── scripts/
    └── sample-data.json          # Sample anime data structure (placeholder URLs)
```

---

## 4. Architecture & Data Flow

### 4.1 Home Page (`/`)
```
User visits home
  → Firestore: getDocs(collection "animes", orderBy createdAt desc)
  → Client-side: filter by search term + language
  → Client-side: sort (newest / most episodes / random)
  → Featured anime (featuredRank 1–10) always shown first
  → Grouped by language → horizontal scroll rows
  → "View All" button → navigates to /language/[lang]
```

### 4.2 Language Page (`/language/[lang]`)
```
User visits /language/Hindi (example)
  → Firestore: getDocs (ALL animes fetched)
  → Client-side: filter where anime.language === lang
  → Featured (rank 1–10) sorted first
  → Rest of anime shuffled randomly
  → Displayed in responsive grid
```

### 4.3 Admin Panel (`/admin`)
```
Admin visits /admin
  → Password gate (client-side check)
  → On unlock: Firestore fetch all animes

  ADD:   image → Cloudinary upload → get URL → addDoc to Firestore
  EDIT:  updateDoc (name, language, season, episodes, rank) — no image re-upload
  DELETE: deleteDoc from Firestore
  RANK:  updateDoc featuredRank field (1–10)
  DOWNLOAD: generates .txt file client-side (no server needed)
```

---

## 5. Features

### 5.1 Public — Home Page
- Hero section with live stats: total anime, total episodes, language count
- Search by anime name (client-side, real-time)
- Filter by language (dropdown + tag buttons)
- Sort by: Newest First / Most Episodes / Random
- Anime grouped by language in horizontal scrollable rows
- Featured ranking system: ranks 1–10 always appear at top
- "View All" per language group

### 5.2 Public — Language Page
- Full grid view of all anime in one language
- Same featured-first + shuffled-rest ordering
- Back button to return to home

### 5.3 Anime Card Component
- Poster image with hover effects (scale + play button overlay)
- Language-colored gradient badge:
  - Hindi → Orange/Red
  - English → Blue/Cyan
  - Japanese → Pink/Rose
  - Chinese → Yellow/Orange
- Season display logic:
  - `"1-3"` → `"Seasons 1-3"`
  - `"3"` → `"Season 3"`
  - freeform text → displayed as-is
- Episode count badge
- Image error fallback (gradient + play icon)

### 5.4 Admin Panel
- Password-gated dashboard
- Stats cards: total anime, total episodes, language count
- Language breakdown table
- "Incomplete anime" alert (missing season or episodes)
- Add anime form: name, language, season, episodes, featured rank, image upload
- Manage list: search, click-to-edit modal, set featured rank, delete
- Download collection as `.txt` file with configurable fields (name, language, season, episodes, rank, image URL)

---

## 6. Environment Variables Required

Create a `.env.local` file in the project root:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

---

## 7. Firestore Data Model

### Collection: `animes`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | Anime title |
| `language` | string | ✅ | Japanese / Hindi / English / Korean / Chinese |
| `season` | string | ❌ | e.g. "Season 3", "1-3", "Final Season" |
| `totalEpisodes` | number | ❌ | Total episode count |
| `imageUrl` | string | ✅ | Cloudinary secure URL |
| `featuredRank` | number | ❌ | 1–10, controls featured order |
| `createdAt` | timestamp | ✅ | Firestore serverTimestamp() |

---

## 8. Known Issues & Concerns

### 8.1 Security
| Issue | Severity | Details |
|---|---|---|
| Hardcoded admin password | 🔴 High | `"himanshu4526"` is visible in client-side JS via browser devtools |
| No server-side auth | 🔴 High | All Firestore write/delete operations accessible to anyone who bypasses the password UI |
| Open Firestore rules (potential) | 🔴 High | If Firebase rules are `allow read, write: if true`, anyone can access the DB directly |
| Unsigned Cloudinary preset | 🟡 Medium | Anyone with cloud name + preset can upload files to your Cloudinary account |
| NEXT_PUBLIC Firebase keys | 🟢 Low | Normal for Firebase client-side use, but requires locked Firestore security rules |

### 8.2 Build Configuration
| Issue | Severity | Details |
|---|---|---|
| `ignoreBuildErrors: true` | 🟡 Medium | TypeScript errors silently ignored during builds |
| `eslint.ignoreDuringBuilds: true` | 🟡 Medium | Lint issues never surface during CI/CD |
| `images: { unoptimized: true }` | 🟡 Medium | Disables Next.js WebP conversion, responsive sizes, lazy load optimization |

### 8.3 Data Fetching
| Issue | Severity | Details |
|---|---|---|
| No pagination | 🟡 Medium | All Firestore docs fetched every time — will slow down as collection grows |
| Language page fetches all then filters client-side | 🟡 Medium | Should use `where("language", "==", lang)` Firestore query |
| No real-time updates | 🟢 Low | Uses `getDocs` (one-shot), not `onSnapshot` — fine for this use case |

### 8.4 Code Quality
| Issue | Severity | Details |
|---|---|---|
| `manage-anime.tsx` is empty | 🟢 Low | File exists but has no content; all manage logic is inline in `page.tsx` |
| `firebase: "latest"` in package.json | 🟡 Medium | Unpinned version — can silently pull breaking changes on fresh install |
| `next-themes` installed but unused | 🟢 Low | App uses custom ThemeProvider; `next-themes` is dead weight |
| `window.location.href` in page.tsx | 🟢 Low | "View All" button causes full page reload; should use Next.js `<Link>` or `useRouter` |
| `shuffle()` runs on every render | 🟡 Medium | Random sort re-shuffles on any state change; should be wrapped in `useMemo` |
| `createdAt?.seconds` comparison | 🟢 Low | Can produce `NaN` if `createdAt` is null before Firestore resolves `serverTimestamp()` |
| Edit modal has no image update | 🟢 Low | `imageUrl` field excluded from `saveAnimeEdit` — can't change cover image after adding |
| sample-data.json has placeholder URLs | 🟢 Low | `https://example.com/aot.jpg` etc. are dummy URLs; no seed script exists to use this file |
| 50 shadcn/ui components installed | 🟢 Low | Most are unused (calendar, carousel, OTP, chart etc.) — bloat from default shadcn init |

---

## 9. How to Run

### Install dependencies
```bash
npm install --legacy-peer-deps
```
> `--legacy-peer-deps` is required because `vaul@0.9.x` has not yet declared support for React 19

### Run development server
```bash
npm run dev
```

Visit `http://localhost:3000`

### Build for production
```bash
npm run build
npm run start
```

---

## 10. Deployment (Vercel)

1. Push code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add all `.env.local` variables in Vercel → Project Settings → Environment Variables
4. Deploy

---

## 11. Recommended Improvements (Priority Order)

1. **Replace hardcoded password with Firebase Authentication** (Google Sign-In or Email/Password)
2. **Lock Firestore security rules** — only authenticated admin can write
3. **Use Firestore `where` query** on language page instead of fetching all + filtering
4. **Memoize `shuffle()`** with `useMemo` to prevent re-shuffle on every render
5. **Pin `firebase` version** in package.json (e.g. `"firebase": "^10.12.0"`)
6. **Enable image optimization** — remove `unoptimized: true` and configure Cloudinary domain in `next.config.mjs`
7. **Support image update** in edit modal
8. **Move admin logic** out of `page.tsx` into `manage-anime.tsx` or separate components
9. **Add pagination** or infinite scroll to home page for large collections
10. **Remove unused shadcn/ui components** to reduce bundle size

---

*Report generated based on full codebase analysis — July 2026*
