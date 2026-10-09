# LiveTVStreaming.services – Technical & Deployment Documentation

Production-ready, data-driven programmatic SEO (pSEO) website for **[livetvstreaming.services](https://livetvstreaming.services)**. Built as an independent, trustworthy editorial publication that helps US cord-cutters compare live TV streaming services and find where their channels are carried at the lowest price.

---

## 1. Architecture & Design Principles

### Aesthetic Constitution
- **Light Mode Only:** Hardcoded `color-scheme: light`. Warm off-white background (`#FAF8F5`) with pure white card surfaces and 1px hairline borders (`#E7E2DA`). Zero glowing blobs, purple gradients, glassmorphism, or decorative emojis in headings.
- **Color Accents:** Deep editorial green (`#0F5C4A`) for primary links and action buttons; warm terracotta accent (`#C2410C`) used strictly for &ldquo;Best Match&rdquo; and &ldquo;Top Pick&rdquo; highlights.
- **Status Indicators:** Muted green checkmark (`✓`) for included channels/features; neutral gray dash (`–`) for missing features. Never red &ldquo;X&rdquo; walls.
- **Typography:** Serif headlines (`Newsreader` / Georgia editorial stack) paired with a high-legibility sans (`Public Sans` / system UI) for UI controls. Every price and channel metric uses tabular numbers (`font-variant-numeric: tabular-nums`).

---

## 2. Directory Structure

```text
/
├── public/
│   ├── robots.txt               # Directs crawlers to sitemap-index.xml
│   └── sitemap-index.xml        # Master index pointing to split sub-sitemaps
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Sticky nav, mobile slide-down menu with Escape & focus trap
│   │   ├── Footer.tsx           # Categorized directory links, disclaimers, editorial badges
│   │   ├── Breadcrumbs.tsx      # Semantic breadcrumbs with Schema.org BreadcrumbList
│   │   ├── ChannelFinder.tsx    # Interactive client island (preset bundles, URL query sync, ARIA live)
│   │   ├── ComparisonTable.tsx  # Multi-column sortable table with mobile horizontal scroll
│   │   ├── ServiceCard.tsx      # Compact ranked cards
│   │   ├── VerdictBox.tsx       # Score, pros/cons, key specifications
│   │   ├── FAQ.tsx              # Accessible accordion with Schema.org FAQPage output
│   │   ├── CTAButton.tsx        # rel="sponsored nofollow noopener" affiliate button
│   │   └── TrustElements.tsx    # Author byline, LastUpdated, AffiliateDisclosure, AdSlot
│   ├── data/                    # Single source of truth (JSON)
│   │   ├── services.json        # 7 legal US live TV providers with affiliate links & pricing
│   │   ├── channels.json        # 60+ popular US cable & local channels with category tags
│   │   ├── markets.json         # Top 25 US DMAs with affiliate call letters & service carriage
│   │   ├── teams.json           # All 32 NFL teams & all 30 NBA teams broadcast info
│   │   ├── devices.json         # 11 major streaming platforms & smart TVs
│   │   └── authors.json         # Editorial staff profiles and test credentials
│   ├── lib/
│   │   ├── coverage.ts          # Instant coverage calculation, pricing math, best match logic
│   │   ├── routes.ts            # Client and static route parsing & internal linking algorithms
│   │   ├── seo.ts               # Title templates, description variations, JSON-LD schemas
│   │   └── sitemap.ts           # Dynamic XML sitemap generators split by page type
│   ├── types/
│   │   └── index.ts             # TypeScript definitions for all datasets and components
│   ├── views/                   # Page templates for all programmatic & editorial routes
│   │   ├── HomeView.tsx
│   │   ├── ServiceDetailView.tsx
│   │   ├── ComparisonView.tsx
│   │   ├── ChannelDetailView.tsx
│   │   ├── LocalMarketView.tsx
│   │   ├── TeamView.tsx
│   │   ├── DeviceView.tsx
│   │   ├── HubView.tsx
│   │   ├── StaticTrustView.tsx
│   │   ├── SitemapViewer.tsx
│   │   └── NotFoundView.tsx
│   ├── App.tsx                  # Root router, dynamic head manager & layout frame
│   └── index.css                # Tailwind CSS layers and font tokens
├── astro.config.mjs             # Astro static output configuration for Cloudflare Pages
├── package.json
└── tsconfig.json
```

---

## 3. How to Update Data

### A. Updating Affiliate Links
All affiliate links are centralized in `/src/data/services.json`. Search for the `affiliateUrl` field and replace the `#AFFILIATE_SERVICEID` placeholders with your actual network links (Impact, Commission Junction, Rakuten, etc.):

```json
{
  "id": "youtube-tv",
  "name": "YouTube TV",
  "affiliateUrl": "https://tv.youtube.com/welcome/?partner=YOUR_ID"
}
```

### B. Adding a New Channel
Open `/src/data/channels.json` and append an entry to the `channels` array:

```json
{
  "id": "mlb-tv",
  "name": "MLB Network",
  "slug": "mlb-network",
  "category": "sports",
  "logo": "/logos/channels/mlb-network.svg",
  "description": "24/7 Major League Baseball coverage and live out-of-market games.",
  "availableOn": ["fubo", "directv-stream"]
}
```
*Note: Once added, the Channel Finder, Channel Hub, and all programmatic comparison pages will automatically recalculate coverage.*

### C. Adding a Local Television Market (DMA)
Open `/src/data/markets.json` and append to the `markets` array with local station call letters:

```json
{
  "id": "miami-fl",
  "name": "Miami-Ft. Lauderdale, FL",
  "slug": "miami-fl",
  "city": "Miami",
  "state": "FL",
  "dmaRank": 16,
  "localAffiliates": {
    "abc": "WPLG 10",
    "cbs": "WFOR-TV 4",
    "nbc": "WTVJ 6",
    "fox": "WSVN 7",
    "cw": "WSFL-TV 39",
    "pbs": "WPBT 2"
  },
  "availability": {
    "youtube-tv": { "abc": true, "cbs": true, "nbc": true, "fox": true, "cw": true, "pbs": true },
    "hulu-live": { "abc": true, "cbs": true, "nbc": true, "fox": true, "cw": true, "pbs": false }
  }
}
```

---

## 4. Deploying to Cloudflare Pages (Free)

Cloudflare Pages provides global zero-latency edge distribution, free automated SSL, and instant rollbacks.

### Step 1: Push to GitHub / GitLab
Initialize git and push to your repository:
```bash
git init
git add .
git commit -m "Initial commit of LiveTVStreaming.services"
git branch -M main
git remote add origin https://github.com/your-username/livetvstreaming-services.git
git push -u origin main
```

### Step 2: Connect in Cloudflare Dashboard
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Connect to Git**.
2. Select your repository `livetvstreaming-services`.
3. Set **Build settings**:
   - **Framework preset:** `Vite` (or `None`)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**.

### Step 3: Configure Custom Domain
1. In Cloudflare Pages, go to **Custom domains** &rarr; **Set up a custom domain**.
2. Enter `livetvstreaming.services` (and `www.livetvstreaming.services`).
3. Cloudflare automatically activates universal SSL/TLS with HTTP/2 and HTTP/3 support.

---

## 5. Programmatic SEO (pSEO) Matrix

The site generates unique, data-rich static pages across multiple high-intent keyword verticals:
- **Service Reviews:** `/services/[slug]/` &mdash; *Target:* `[Service] review`, `[Service] channel lineup`
- **Head-to-Head Comparisons:** `/compare/[a]-vs-[b]/` (21 combinations) &mdash; *Target:* `[A] vs [B]`
- **Channel Guides:** `/channels/[slug]/` &mdash; *Target:* `How to watch [Channel] without cable`
- **Local Television DMAs:** `/local/[market-slug]/` &mdash; *Target:* `Live TV streaming in [City]`
- **Sports Franchise Guides:** `/watch/[league]/[team-slug]/` &mdash; *Target:* `How to watch [Team] games without cable`
- **Device Guides:** `/devices/[slug]/` &mdash; *Target:* `Best live TV streaming service for [Device]`
- **Split XML Sitemaps:** Referenced at `/sitemap-index.xml` and `/robots.txt`
