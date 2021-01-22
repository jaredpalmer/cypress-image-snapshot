---
'cypress-image-snapshot': patch
---

When using native retries that come in Cypress v5+ real image failures are marked as passed on the retries because cypress names the snapshots as 'filename (attempt X).png (and there is no configuration option to change this). The fix just removes the ' (attempt X)' suffix from the filename.
