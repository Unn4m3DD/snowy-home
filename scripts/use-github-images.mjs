import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [repository, revision] = process.argv.slice(2);
if (!/^[\w.-]+\/[\w.-]+$/.test(repository || "") || !/^[a-f0-9]{40}$/.test(revision || "")) {
  throw new Error("Usage: node scripts/use-github-images.mjs OWNER/REPO FULL_ASSET_COMMIT_SHA");
}
const baseUrl = `https://raw.githubusercontent.com/${repository}/${revision}/`;
const manifestUrl = `${baseUrl}image-manifest.json`;
const response = await fetch(manifestUrl);
if (!response.ok) throw new Error(`Cannot read image manifest: HTTP ${response.status}`);
const manifest = await response.json();
const originals = new Map(manifest.photos.map((photo) => [`${photo.listingId}/${photo.index}`, photo]));
const dataPath = path.join(root, "public/data/listings.json");
const data = JSON.parse(await fs.readFile(dataPath, "utf8"));
let count = 0;
for (const listing of data.listings) {
  for (const photo of listing.photos) {
    const original = originals.get(`${listing.id}/${photo.index}`);
    if (!original) throw new Error(`Missing original: ${listing.id}/${photo.index}`);
    const url = new URL(original.path.split("/").map(encodeURIComponent).join("/"), baseUrl).href;
    photo.sourceOriginal = photo.sourceOriginal || original.sourceUrl || photo.original;
    photo.src = url;
    photo.original = url;
    count++;
  }
}
const host = { repository, revision, branch: "images", baseUrl, manifestUrl, photoCount: count };
data.imageHost = host;
await fs.writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`);
await fs.writeFile(path.join(root, "image-host.json"), `${JSON.stringify(host, null, 2)}\n`);
console.log(JSON.stringify({ repository, revision, photoCount: count }));
