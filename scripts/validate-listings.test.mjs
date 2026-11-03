import assert from "node:assert/strict";
import test from "node:test";
import { validateListingEvidence } from "./validate-listings.mjs";

test("Needs review and forceReview do not waive the AC requirement", () => {
  for (const status of ["review", "match", "screened", "excluded"]) {
    assert.throws(() => validateListingEvidence({ listings: [{
      id: "no-ac", status, forceReview: true, requiresApproval: true,
      acTag: false, acText: false, photoAc: "no", photos: [{ ac: "no" }],
    }] }), /no-ac/);
  }
});

test("Either a listing claim or definite/possible photo evidence is sufficient", () => {
  for (const evidence of [
    { acTag: true }, { acText: true },
    { photos: [{ ac: "yes" }] }, { photos: [{ ac: "possible" }] },
  ]) {
    assert.doesNotThrow(() => validateListingEvidence({ listings: [{
      id: "candidate", status: "review", acTag: false, acText: false,
      photos: [], ...evidence,
    }] }));
  }
});

test("Pending analysis and an unsupported aggregate label are not AC evidence", () => {
  assert.throws(() => validateListingEvidence({ listings: [{
    id: "unverified", acTag: false, acText: false,
    photoAc: "yes", photos: [{ ac: "pending" }],
  }] }), /unverified/);
});
