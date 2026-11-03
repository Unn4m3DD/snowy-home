import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";

export function validateListingEvidence(data) {
  const invalid = data.listings.filter((listing) =>
    listing.acTag !== true && listing.acText !== true &&
    !listing.photos.some((photo) => photo.ac === "yes" || photo.ac === "possible")
  );
  if (invalid.length) {
    throw new Error(`Listings without AC evidence cannot be published: ${invalid.map((listing) => listing.id).join(", ")}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const source = process.argv[2] || new URL("../public/data/listings.json", import.meta.url);
  const data = JSON.parse(await fs.readFile(source, "utf8"));
  validateListingEvidence(data);
  console.log(`AC evidence verified for all ${data.listings.length} published listings.`);
}
