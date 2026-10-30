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
