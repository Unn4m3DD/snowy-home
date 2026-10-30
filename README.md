# Snowy Home — original listing photos

This branch stores the downloaded original image files for the Covilhã rental search. Files are copied byte-for-byte, without resizing or re-encoding.

`image-manifest.json` records every image’s listing ID, source URL, dimensions and SHA-256 checksum.

Application source is on the `main` branch. The app references these files through immutable GitHub raw URLs pinned to this branch’s asset commit. Images are not part of the Sites deployment bundle.
