# COSTA publisher registry

`publishers.json` is an open index that helps consumers find COSTA feeds. It is not a data store: product data stays on each publisher's domain.

Each entry:

```json
{
  "feed": "https://producer.example/.well-known/costa/feed.json",
  "publisher": "Producer legal name",
  "healthCanadaLicenceNumbers": ["..."],
  "gs1CompanyPrefixes": ["..."],
  "added": "YYYY-MM-DD"
}
```

To add or change an entry, open a pull request from an account that can show control of the feed's domain (for example, a commit link published at `/.well-known/costa/registry-proof.txt`). Maintainers check that the GS1 company prefixes listed belong to the publisher before merging. Entries are never deleted; set `"retired": "YYYY-MM-DD"` instead, so historical GTIN lookups keep working.
