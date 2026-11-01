# Daily rental search

Run locally in `/Users/andrepatacas/repos/personal/snowy-home` on this Mac. The local MLX vision model is required. Never substitute a remote vision service. Node 24 is at `/Users/andrepatacas/.local/share/mise/installs/node/24.21.0/bin`. App source is `app/`; original photos and research scripts are in the parent workspace. Do not run destructive Git resets or overwrite unrelated edits.

## Requirements

Rent at most €1100/month, T1 or larger, separate bedroom plus a different interior room visible in at least two photos; AC claimed in tags/text OR definite/possible appliance in photos. Prefer false positives, clearly marking uncertainty. Hospital Pêro da Covilhã car drive at most 30 min (destination and reproducible routing are in `research/commutes.json`). Move-in 15 December 2026, rent from 1 December acceptable. Check the year and availability; no guessed availability. Exclude every ad tagged or described as arrendamento temporário / temporary rental. A temporary tag on any duplicate source excludes the whole apartment; never add these to the tracker, including review. Do not filter discovery by AC tags, because they are unreliable. Preserve studios/conflicts with AC evidence for review rather than silently excluding uncertain candidates.

## Discovery and normalization

Read `research/agency-coverage.md`, all `research/*listings.json`, `research/duplicate-pairs.json`, and current `app/public/data/listings.json` before searching. Search unfiltered rental pages around Covilhã, Fundão, Belmonte and nearby villages within the commute limit. Cover Idealista, Imovirtual, Casa Sapo, Imovia24, CustoJusto, RE/MAX, ERA, OLX, Supercasa, Casacerta and Bquarto; follow public cross-posts and indexed ads when direct sites are blocked. Use current search/browser tools and public source pages. Never bypass captchas or access controls. Record blocked sources and incomplete coverage honestly. Do not infer that a disappeared search result is rented without evidence.

Every newly discovered apartment must enter Needs review, regardless of model confidence. Set requiresApproval=true; never approve an apartment or reset an existing approval during automation runs. Evidence status and user approval are separate.

Append newly discovered IDs to `research/daily-listings.json` (a JSON array), using the same normalized record shape as existing agency records: id, source, url, title, price, bedrooms/typology, town/address, area, description, location.coordinates where available, acTag/acText, garage/furnished evidence, checked (actual source check date), and images [{url,path}]. Download originals in source order to `research/photos/<id>/<nn>.<extension>`, preserving bytes and accurate image types. IDs and existing image indices must stay stable. Do not replace an existing original at the same path. If an ad has changed photos, give changed photos new paths and invalidate only affected vision results. Track each run in `research/daily-runs/YYYY-MM-DD.md`, with searched sources, new IDs, failures and counts. Maintain `research/search-state.json` with checked (human date) and lastRun (ISO timestamp), without changing old per-listing checked dates unless actually revisited.

Before publishing a new apartment, open its complete gallery and compare the number of downloaded original photos with the source gallery count. Retrieve every photo in source order, not just covers, thumbnails, or AC-positive images. If the full gallery is blocked, keep the candidate in the local research backlog and report the blocker; do not publish a cover-only entry. For an existing partial gallery, preserve its ID and existing photo indices while filling the missing photographs.

## Local classification and evidence

Run `.venv/bin/python scripts/analyse_photos.py`. It includes daily-listings.json and skips already classified paths; never rerun all images unnecessarily. Model is mlx-community/Qwen3-VL-4B-Instruct-4bit, local MLX. Check ambiguous AC objects and separate room evidence using the downloaded photos; record corrections in `research/visual-review.json`. Keep original inference output intact. Preserve definite/possible/claim-only distinctions. An outdoor condenser is only possible evidence unless it demonstrably serves the apartment.

Run `.venv/bin/python scripts/compute_commutes.py research/daily-listings.json`. Review any reused town-centre pins, location conflicts and commute uncertainty. Check new ads against known galleries and source IDs; update reviewed duplicate pairs without merge cycles, preserving all source links.

## Publish data and images, without a Sites deployment

Tracking data lives in Turso and is NEVER part of listing imports, exports, repository data or search logs. Never read, reset, replace, seed or delete users' notes, visits, contact statuses, approvals or removals. Stable IDs ensure removed apartments stay removed.

Run `.venv/bin/python scripts/publish_github_images.py` only if new originals need hosting. It preserves originals, updates the images branch manifest, pushes via the existing gh authentication, and pins the new immutable asset commit in app/image-host.json. Run `.venv/bin/python scripts/build_data.py`, then Node 24 `./node_modules/.bin/tsc --noEmit` inside app/. Verify every new photo is classified or explicitly pending/error, room evidence and routes are honest, and raw GitHub images load. Keep gallery source order. Do not add public/photos back into the bundle.

Commit and push only generated `public/data/listings.json` and `image-host.json` changes in app/ to the existing GitHub remote `github` main. Preserve other work. After the tracker code is deployed, `/api/listings` reads the public JSON from GitHub main, so routine data updates require no Sites deployment. Verify GitHub JSON and new image bytes after pushing. If no new candidates or meaningful changes appear, record the run without an empty commit. No Sites deployments unless the user explicitly requests one. If publication or source access fails, preserve the completed local research and report the failure; never claim the live tracker was updated.

Report new qualifying/review candidates or meaningful changes with links and AC evidence. Routine unchanged searches should stay quiet. Report failures or user action required. Daily local runs need this Mac awake and Codex able to run; do not claim cloud scheduling or a successful scan merely because a schedule exists.
