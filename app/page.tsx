"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Car,
  Check,
  Heart,
  MapPin,
  Snowflake,
  SlidersHorizontal,
  Images,
  ExternalLink,
  Info,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Photo = {
  src: string;
  original: string;
  index: number;
  ac: string;
  room: string;
  description: string;
  acLocation: string;
};
type Listing = {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  typology: string;
  area: string;
  address: string;
  town: string;
  source: string;
  url: string;
  otherUrls?: { url: string; source: string }[];
  agency: string;
  garage: string;
  floor: string;
  furnished: string;
  available: string;
  conditions: string[];
  notes: string[];
  acTag: boolean;
  acText: boolean;
  acQuote: string;
  photoAc: string;
  roomCheck: boolean;
  roomEvidence: string;
  photos: Photo[];
  minutes: number | null;
  km: number | null;
  commuteNote: string;
  routeUrl: string;
  status: string;
  updated: string;
  checked: string;
};
type Data = {
  listings: Listing[];
  checked: string;
  model: string;
  coverage: { source: string; status: string; count?: number; url: string }[];
  screened: number;
  photoCount: number;
  limits: string[];
};
const euro = (n: number) =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
function AC({ l }: { l: Listing }) {
  return (
    <div className="evidence-pills">
      <span
        className={
          l.photoAc === "yes"
            ? "evidence yes"
            : l.photoAc === "possible"
              ? "evidence possible"
              : "evidence neutral"
        }
      >
        <Snowflake size={13} />
        {l.photoAc === "yes"
          ? "AC in photos"
          : l.photoAc === "possible"
            ? "Possible AC in photos"
            : l.photoAc === "unavailable"
              ? "Photos unavailable"
              : l.photoAc === "pending"
                ? "Photos awaiting check"
                : "AC not seen in photos"}
      </span>
      <span
        className={l.acTag || l.acText ? "evidence yes" : "evidence neutral"}
      >
        {l.acTag || l.acText ? <Check size={13} /> : null}
        {l.acTag ? "AC tag" : l.acText ? "AC in description" : "No AC claim"}
      </span>
    </div>
  );
}
function PhotoView({ l, onOpen }: { l: Listing; onOpen: () => void }) {
  const [i, setI] = useState(
    Math.max(
      l.photos.findIndex((p) => p.ac === "yes"),
      0,
    ),
  );
  const p = l.photos[i];
  return (
    <div className="card-photo">
      <button
        className="photo-open"
        onClick={onOpen}
        aria-label={`Inspect photos of ${l.title}`}
      >
        {p ? (
          <img
            src={p.src}
            alt={`${p.room || "Interior"} · ${l.address}`}
            loading="lazy"
          />
        ) : (
          <div className="missing-photo">
            <Images />
            Photos unavailable
          </div>
        )}
      </button>
      <span className="photo-type">
        {l.typology} <span>· {l.area || "?"} m²</span>
      </span>
      {l.photos.length > 1 && (
        <>
          <button
            className="photo-arrow previous"
            aria-label="Previous photo"
            onClick={() => setI((i + l.photos.length - 1) % l.photos.length)}
          >
            <ArrowLeft size={15} />
          </button>
          <button
            className="photo-arrow next"
            aria-label="Next photo"
            onClick={() => setI((i + 1) % l.photos.length)}
          >
            <ArrowRight size={15} />
          </button>
          <span className="photo-count">
            <Images size={12} />
            {i + 1} / {l.photos.length}
          </span>
        </>
      )}
      {p?.ac === "yes" && (
        <span className="photo-ac">
          <Snowflake size={12} />
          AC visible
        </span>
      )}
      {p?.ac === "possible" && (
        <span className="photo-ac uncertain">Possible AC</span>
      )}
    </div>
  );
}
export default function Home() {
  const [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(false),
    [q, setQ] = useState(""),
    [budget, setBudget] = useState(1100),
    [minBeds, setMinBeds] = useState(1),
    [town, setTown] = useState("all"),
    [ac, setAc] = useState("all"),
    [garage, setGarage] = useState(false),
    [sort, setSort] = useState("evidence"),
    [view, setView] = useState("matches"),
    [saved, setSaved] = useState<string[]>([]),
    [selected, setSelected] = useState<Listing | null>(null),
    [photo, setPhoto] = useState(0),
    [showMethod, setShowMethod] = useState(false),
    [filters, setFilters] = useState(false);
  useEffect(() => {
    fetch("/data/listings.json")
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((value) => setData(value as Data))
      .catch(() => setError(true));
    try {
      setSaved(JSON.parse(localStorage.getItem("covilha-saved") || "[]"));
    } catch {}
  }, []);
  function toggleSave(id: string) {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    setSaved(next);
    localStorage.setItem("covilha-saved", JSON.stringify(next));
  }
  function open(l: Listing) {
    setSelected(l);
    setPhoto(
      Math.max(
        l.photos.findIndex((p) => p.ac === "yes"),
        0,
      ),
    );
  }
  const listings = data?.listings || [];
  const matches = listings.filter((l) => l.status === "match");
  const towns = Array.from(new Set(listings.map((l) => l.town))).sort();
  const filtered = listings
    .filter(
      (l) =>
        (view === "all" ||
          (view === "saved" && saved.includes(l.id)) ||
          (view === "matches" && l.status === "match") ||
          (view === "review" && l.status === "review")) &&
        l.price <= budget &&
        l.bedrooms >= minBeds &&
        (town === "all" || l.town === town) &&
        (!garage ||
          l.garage.toLowerCase().includes("included") ||
          l.garage.toLowerCase().includes("yes")) &&
        (ac === "all" ||
          (ac === "photo" && ["yes", "possible"].includes(l.photoAc)) ||
          (ac === "both" &&
            ["yes", "possible"].includes(l.photoAc) &&
            (l.acTag || l.acText)) ||
          (ac === "claim" && (l.acTag || l.acText))) &&
        `${l.title} ${l.address} ${l.town} ${l.agency}`
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price"
        ? a.price - b.price
        : sort === "commute"
          ? (a.minutes ?? 999) - (b.minutes ?? 999)
          : sort === "space"
            ? Number(b.area) - Number(a.area)
            : (a.photoAc === "yes" ? 0 : a.photoAc === "possible" ? 1 : 2) -
                (b.photoAc === "yes" ? 0 : b.photoAc === "possible" ? 1 : 2) ||
              a.price - b.price,
    );
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Covilhã rentals home">
          <span className="brand-mark">
            <Building2 size={19} />
          </span>
          <strong>
            Covilhã<span> / rentals</span>
          </strong>
        </a>
        <div className="top-meta">
          <span className="live-dot" />
          Checked {data?.checked || "30 Oct 2026"}
          <button onClick={() => setShowMethod(true)}>
            Sources & checks <ArrowUpRight size={13} />
          </button>
        </div>
      </header>
      <section className="intro">
        <div>
          <div className="eyebrow">
            <MapPin size={13} />
            HOSPITAL PÊRO DA COVILHÃ
          </div>
          <h1>
            Apartments to rent<span>.</span>
          </h1>
          <div className="requirements">
            <span>
              <Snowflake size={14} />
              AC evidence
            </span>
            <span>
              <BedDouble size={14} />
              T1 or larger
            </span>
            <span>
              <Car size={14} />≤ 30 min drive
            </span>
            <span>≤ €1,100 / month</span>
          </div>
        </div>
        <div className="move-in">
          <span>MOVE-IN</span>
          <strong>15 Dec 2026</strong>
          <small>1 Dec for a good deal</small>
        </div>
      </section>
      <div className="workspace">
        <aside className={filters ? "filters open" : "filters"}>
          <div className="filter-title">
            <SlidersHorizontal size={15} />
            <strong>Filters</strong>
            <button
              onClick={() => {
                setQ("");
                setBudget(1100);
                setMinBeds(1);
                setTown("all");
                setAc("all");
                setGarage(false);
              }}
            >
              Reset
            </button>
          </div>
          <label>
            Search
            <Input
              placeholder="Street, area, agency…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <label>
            Maximum rent <strong className="range-value">{euro(budget)}</strong>
            <input
              aria-label="Maximum rent"
              type="range"
              min={250}
              max={1100}
              step={25}
              value={budget}
              onChange={(e) => setBudget(+e.target.value)}
            />
            <div className="range-labels">
              <span>€250</span>
              <span>€1,100</span>
            </div>
          </label>
          <label>
            Bedrooms
            <div className="bed-options">
              {[1, 2, 3, 4].map((n) => (
                <button
                  aria-label={`At least ${n} bedrooms`}
                  className={minBeds === n ? "active" : ""}
                  onClick={() => setMinBeds(n)}
                  key={n}
                >
                  {n}+
                </button>
              ))}
            </div>
          </label>
          <label>
            Area
            <select value={town} onChange={(e) => setTown(e.target.value)}>
              <option value="all">All areas</option>
              {towns.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            AC evidence
            <select value={ac} onChange={(e) => setAc(e.target.value)}>
              <option value="all">Any evidence</option>
              <option value="photo">Seen / possible in photos</option>
              <option value="both">Photos + listing claim</option>
              <option value="claim">Claimed in tag / text</option>
            </select>
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={garage}
              onChange={(e) => setGarage(e.target.checked)}
            />
            Garage / parking included
          </label>
          <div className="filter-note">
            <Car size={15} />
            <p>
              Drive times use the advertised location. Approximate pins and
              traffic can change the result.
              <button onClick={() => setShowMethod(true)}>
                See routing details <ArrowUpRight size={12} />
              </button>
            </p>
          </div>
        </aside>
        <main className="results">
          <div className="results-tabs">
            <div role="tablist" aria-label="Listing status">
              {[
                ["matches", "Matches", matches.length],
                [
                  "review",
                  "Needs review",
                  listings.filter((l) => l.status === "review").length,
                ],
                ["all", "All screened", listings.length],
                ["saved", "Saved", saved.length],
              ].map(([key, label, count]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={view === key}
                  className={view === key ? "active" : ""}
                  onClick={() => setView(String(key))}
                >
                  {label}
                  <span>{count}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="results-toolbar">
            <p>
              <strong>{filtered.length}</strong>{" "}
              {view === "matches"
                ? "matching apartments"
                : view === "review"
                  ? "listings to verify"
                  : view === "saved"
                    ? "saved listings"
                    : "screened listings"}
              <span>
                {" "}
                ·{" "}
                {view === "matches"
                  ? "AC photo evidence or an explicit AC claim"
                  : "Check the evidence before shortlisting"}
              </span>
            </p>
            <div>
              <button
                className="mobile-filter"
                onClick={() => setFilters(!filters)}
              >
                <SlidersHorizontal size={15} />
                Filters
              </button>
              <select
                aria-label="Sort listings"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="evidence">Photo evidence first</option>
                <option value="price">Lowest rent first</option>
                <option value="commute">Shortest drive first</option>
                <option value="space">Largest first</option>
              </select>
            </div>
          </div>
          {!data ? (
            <div className="empty">
              {error
                ? "Could not load listings. Please reload."
                : "Loading researched listings…"}
            </div>
          ) : (
            <>
              <div className="cards">
                {filtered.map((l) => (
                  <article className="listing-card" key={l.id}>
                    <div className="photo-wrap">
                      <PhotoView l={l} onOpen={() => open(l)} />
                      <button
                        className={saved.includes(l.id) ? "save saved" : "save"}
                        onClick={() => toggleSave(l.id)}
                        aria-label={
                          saved.includes(l.id)
                            ? "Remove from saved"
                            : "Save apartment"
                        }
                      >
                        <Heart
                          size={17}
                          fill={saved.includes(l.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    <div className="card-body">
                      <div className="price-line">
                        <div>
                          <strong>{euro(l.price)}</strong>
                          <span>/ month</span>
                        </div>
                        <a
                          href={l.routeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="commute"
                          title={l.commuteNote}
                        >
                          <Car size={14} />
                          {l.minutes !== null
                            ? `~${l.minutes} min est.`
                            : "Time unknown"}
                          <ArrowUpRight size={12} />
                        </a>
                      </div>
                      <h2>
                        <button onClick={() => open(l)}>{l.title}</button>
                      </h2>
                      <p className="address">
                        <MapPin size={13} />
                        {l.address || l.town}
                      </p>
                      <div className="facts">
                        <span>
                          <BedDouble size={14} />
                          {l.bedrooms}{" "}
                          {l.bedrooms === 1 ? "bedroom" : "bedrooms"}
                        </span>
                        <span>
                          <Car size={14} />
                          {l.garage === "Unknown"
                            ? "Garage unknown"
                            : l.garage === "Included"
                              ? "Garage included"
                              : l.garage}
                        </span>
                      </div>
                      <AC l={l} />
                      <div
                        className={
                          l.roomCheck ? "room-check" : "room-check warning"
                        }
                      >
                        {l.roomCheck ? <Check size={13} /> : <Info size={13} />}{" "}
                        {l.roomCheck
                          ? "Different rooms seen in photos"
                          : "Separate bedroom needs verification"}
                      </div>
                      {l.status !== "match" && (
                        <div className="status-note">
                          {l.notes[0] || "Insufficient AC evidence"}
                        </div>
                      )}
                      <div className="card-footer">
                        <span>
                          {l.source}
                          <span className="dot-sep">·</span>
                          {l.available}
                        </span>
                        <button onClick={() => open(l)}>
                          Photos & details <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {!filtered.length && (
                <div className="empty">
                  No listings with these filters.
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBudget(1100);
                      setMinBeds(1);
                      setTown("all");
                      setAc("all");
                      setGarage(false);
                      setQ("");
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              )}
              <footer className="results-footer">
                {data.screened} source ads screened · {data.photoCount} photos
                analysed locally · Availability for December needs landlord
                confirmation.
              </footer>
            </>
          )}
        </main>
      </div>
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="listing-dialog" showCloseButton={true}>
          {selected && (
            <>
              <DialogTitle className="dialog-title">
                {selected.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Listing facts and photo evidence.
              </DialogDescription>
              <div className="detail-layout">
                <div className="detail-gallery">
                  {selected.photos.length ? (
                    <>
                      <div className="large-photo">
                        <img
                          src={selected.photos[photo]?.src}
                          alt={`${selected.photos[photo]?.room} photo ${photo + 1}`}
                        />
                        <button
                          aria-label="Previous photo"
                          onClick={() =>
                            setPhoto(
                              (photo + selected.photos.length - 1) %
                                selected.photos.length,
                            )
                          }
                        >
                          <ArrowLeft />
                        </button>
                        <button
                          aria-label="Next photo"
                          onClick={() =>
                            setPhoto((photo + 1) % selected.photos.length)
                          }
                        >
                          <ArrowRight />
                        </button>
                      </div>
                      <div className="photo-caption">
                        <span>
                          Photo {selected.photos[photo]?.index} ·{" "}
                          {selected.photos[photo]?.room} ({photo + 1} /{" "}
                          {selected.photos.length})
                        </span>
                        <a
                          href={selected.photos[photo]?.original}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Original photo <ArrowUpRight size={12} />
                        </a>
                      </div>
                      <div className="photo-evidence">
                        <Snowflake size={15} />
                        <p>
                          {selected.photos[photo]?.ac === "yes"
                            ? "AC detected"
                            : selected.photos[photo]?.ac === "possible"
                              ? "Possible AC — check visually"
                              : selected.photos[photo]?.ac === "pending"
                                ? "Photo awaiting analysis"
                                : "No AC detected in this photo"}
                          {selected.photos[photo]?.acLocation && (
                            <small>{selected.photos[photo].acLocation}</small>
                          )}
                        </p>
                      </div>
                      <div className="thumbnails">
                        {selected.photos.map((p, i) => (
                          <button
                            key={i}
                            className={photo === i ? "selected" : ""}
                            onClick={() => setPhoto(i)}
                            aria-label={`Photo ${i + 1}, ${p.room}, AC ${p.ac}`}
                          >
                            <img src={p.src} alt={p.room} />
                            {["yes", "possible"].includes(p.ac) && (
                              <Snowflake size={12} />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p>Source photos could not be downloaded.</p>
                  )}
                </div>
                <div className="detail-info">
                  <div className="detail-price">
                    {euro(selected.price)}
                    <span> / month</span>
                  </div>
                  <p className="address">
                    <MapPin size={14} />
                    {selected.address}
                  </p>
                  <AC l={selected} />
                  <dl>
                    <div>
                      <dt>Bedrooms</dt>
                      <dd>
                        {selected.typology} · {selected.bedrooms} bedrooms
                      </dd>
                    </div>
                    <div>
                      <dt>Area</dt>
                      <dd>{selected.area || "Unknown"} m²</dd>
                    </div>
                    <div>
                      <dt>Garage / parking</dt>
                      <dd>{selected.garage}</dd>
                    </div>
                    <div>
                      <dt>Floor / lift</dt>
                      <dd>{selected.floor}</dd>
                    </div>
                    <div>
                      <dt>Furnished</dt>
                      <dd>{selected.furnished}</dd>
                    </div>
                    <div>
                      <dt>Available</dt>
                      <dd>{selected.available}</dd>
                    </div>
                    <div>
                      <dt>Hospital drive</dt>
                      <dd>
                        {selected.minutes !== null
                          ? `~${selected.minutes} min · ${selected.km} km`
                          : "Not verified"}
                      </dd>
                    </div>
                  </dl>
                  <p className="detail-note">{selected.commuteNote}</p>
                  <h3>Bedroom photo check</h3>
                  <p className="detail-note">{selected.roomEvidence}</p>
                  {selected.acQuote && (
                    <>
                      <h3>AC claim in listing</h3>
                      <p className="detail-note">{selected.acQuote}</p>
                    </>
                  )}
                  {selected.conditions.length > 0 && (
                    <>
                      <h3>Rental conditions</h3>
                      <ul>
                        {selected.conditions.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {selected.notes.length > 0 && (
                    <>
                      <h3>Verify before renting</h3>
                      <ul>
                        {selected.notes.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div className="detail-actions">
                    <Button asChild>
                      <a href={selected.url} target="_blank" rel="noreferrer">
                        Open {selected.source}
                        <ExternalLink size={14} />
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href={selected.routeUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Driving route <Car size={14} />
                      </a>
                    </Button>
                    {selected.otherUrls?.map((s) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Also on {s.source} <ArrowUpRight size={12} />
                      </a>
                    ))}
                  </div>
                  <small className="detail-note">
                    Source checked {selected.checked}. Ad updated{" "}
                    {selected.updated || "not stated"}. {selected.agency}
                  </small>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showMethod} onOpenChange={setShowMethod}>
        <DialogContent className="method-dialog">
          <DialogTitle>Sources & verification</DialogTitle>
          <DialogDescription className="sr-only">
            Research coverage and verification method.
          </DialogDescription>
          <p>
            Search: ≤ €1,100/month, T1+, ≤ 30 minutes by car to Hospital Pêro da
            Covilhã. Target move-in 15 December 2026; 1 December acceptable.
          </p>
          <h3>AC evidence</h3>
          <p>
            Included if a listing explicitly claims AC in its tags or
            description, or the local model sees a definite or possible AC unit.
            “Not seen” does not mean absent. Pre-installation alone does not
            confirm installed AC.
          </p>
          <h3>Photo checks</h3>
          <p>
            {data?.model}. Downloaded photos analysed on this computer. Bedroom
            checks look for a bedroom and another distinct interior room in
            separate photos. Photo evidence remains a sanity check, not proof of
            the floor plan or working AC.
          </p>
          <h3>Driving times</h3>
          <p>
            OSRM driving routes from advertised pins to the hospital approach
            road; rounded up. These are estimates without live traffic.
            Approximate locations can change the route. Open the route and
            confirm the address before committing.
          </p>
          <h3>Coverage</h3>
          <div className="source-list">
            {data?.coverage.map((c) => (
              <div key={c.source}>
                <a href={c.url} target="_blank" rel="noreferrer">
                  {c.source}
                  <ArrowUpRight size={13} />
                </a>
                <span>{c.status}</span>
              </div>
            ))}
          </div>
          {data?.limits.map((l, i) => (
            <p className="detail-note" key={i}>
              {l}
            </p>
          ))}
          <a href="/data/listings.json" download="covilha-rentals.json">
            Download research data <ArrowUpRight size={13} />
          </a>
        </DialogContent>
      </Dialog>
    </div>
  );
}
