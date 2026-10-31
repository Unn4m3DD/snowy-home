# Snowy Home — Covilhã rentals

Rental shortlist with AC photo evidence, room checks and driving estimates to Hospital Pêro da Covilhã. Built with React, shadcn/ui and Vinext.

## Run locally

Use Node.js 22.13+ (Node 24 is tested):

```sh
npm ci
npm run dev
```

The server prints its local URL. `npm run build` creates the production build.

## Data and original photos

`public/data/listings.json` contains the dated rental snapshot and photo evidence. This is not a live availability feed; confirm availability and rental conditions with the advertiser.

The **images** branch of this repository stores the untouched downloaded originals under `images/<listing-id>/`. Its `image-manifest.json` records source URLs, dimensions and SHA-256 checksums. Application code is on **main**.

The site loads photos directly from `raw.githubusercontent.com`, pinned to the asset commit in `image-host.json`. The displayed photo and “Original photo” link use the full-quality GitHub copy. `sourceOriginal` in the dataset retains the advertiser's photo URL.

No listing photos are included in the Sites deployment bundle. `public/photos/` is intentionally absent and ignored.

After uploading a new asset commit to the images branch, update all image links with:

```sh
node scripts/use-github-images.mjs Unn4m3DD/snowy-home FULL_ASSET_COMMIT_SHA
```

The command validates that the asset manifest covers every photo before writing the dataset. GitHub must remain publicly readable for anonymous site visitors to load images.

## Details links

Each listing has a `/listings/<listing-id>` URL and a Copy link button. Direct loading, refresh and browser Back/Forward open the corresponding listing. Left/Right arrow keys navigate the photos. Details always start at photo 1 in source order; card previews may highlight AC evidence.

## Deployment

The existing Sites project is declared in `.openai/hosting.json`. Deploy only when explicitly requested. The Sites source mirror and this GitHub repository contain the same application commit after publication.

## Shared tracking (Turso)

The tracker is one shared set of records, editable and readable by anyone with the site link. `app/api/tracking/route.ts` keeps Turso access server-side. Records are keyed by stable listing ID and survive daily listing imports. Removal hides a listing from active tabs; the Removed tab can restore it. Visits and notes use Save visit & notes; contact changes save immediately. Other devices refresh when focused and every 30 seconds.

Local secrets: `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in ignored `.env.local` (setup script) and `.dev.vars` (Cloudflare preview). Initialize with `node --env-file=.env.local scripts/setup-tracking-db.mjs`. Configure the same names as hosted Sites runtime secrets before deploying. Never commit credentials, personal tracking data, or `.env.local`.

Daily search instructions: [docs/daily-search.md](docs/daily-search.md). `/api/listings` reads the latest GitHub main dataset in production, so scheduled data updates do not require redeploying the app. Local preview reads the local dataset. Search/classification runs locally with MLX; the Mac must be available.

New discoveries enter Needs review until Approve apartment is clicked; approval syncs through Turso. Move to review reverses approval. Temporary-rental tags on any linked source exclude the apartment entirely from the public dataset. Existing contact/visit/notes records are preserved when listings are excluded.
