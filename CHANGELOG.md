# cypress-image-snapshot

## 4.0.1
### Patch Changes



- [`17f7927`](https://github.com/jaredpalmer/cypress-image-snapshot/commit/17f7927384bfdbd6cbb65d344c8337d32926b691) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - When using native retries that come in Cypress v5+ real image failures are marked as passed on the retries because cypress names the snapshots as 'filename (attempt X).png (and there is no configuration option to change this). The fix just removes the ' (attempt X)' suffix from the filename.
