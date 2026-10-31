export const dynamic = "force-dynamic";
const datasetUrl = "https://raw.githubusercontent.com/Unn4m3DD/snowy-home/main/public/data/listings.json";

export async function GET(request: Request) {
  // Daily data commits update the published tracker without redeploying its code.
  // Local previews continue to show the local research output.
  const host = new URL(request.url).hostname;
  const local = host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  const response = await fetch(local ? new URL("/data/listings.json", request.url) : datasetUrl);
  if (!response.ok) return Response.json({ error: "Listing data unavailable" }, { status: 503 });
  return new Response(response.body, { headers: {
    "Content-Type": "application/json", "Cache-Control": local ? "no-store" : "public, max-age=60",
  } });
}
