# COSTA: open cannabis product data standard

COSTA is an open, royalty-free standard for cannabis product master data, lot data and lab results. Producers publish their own data on their own domains, and anyone can validate it with free tools.

**Version 2.0 (draft for comment).** Read the spec: [`gocosta-schema-spec.md`](gocosta-schema-spec.md).

## What's in 2.0

- **Federal alignment.** The seven classes of cannabis from Schedule 4 of the *Cannabis Act* map one-to-one to the consolidated schedule in the proposed Cannabis Tracking System Order amendment (*Canada Gazette*, Part I, 2026-09-26). Potency follows current label rules (Total THC/CBD, mg/g for dried cannabis), with THC limits checked.
- **Lab reports.** Certificates of analysis as structured data, linked to lots, with checks against the label using the s. 97 tolerances.
- **GTIN history.** GTINs have validity windows and packaging levels, and a normative resolution algorithm keeps recycled or reassigned GTINs from resolving to the wrong product.
- **Provincial profiles.** Machine-checkable rules for Ontario (OCS), British Columbia (BC LDB) and Quebec (SQDC), with Alberta (AGLC) provisional.
- **JSON, JSON-LD and XML.** The XSD is generated from the JSON Schema so the formats can't drift apart.

## Repository

| Path | Contents |
|---|---|
| `gocosta-schema-spec.md` | The specification |
| `schemas/` | JSON Schema, generated XSD, JSON-LD context |
| `profiles/` | Jurisdiction profiles and field mappings |
| `examples/` | Valid examples (JSON and XML) and `invalid/` test cases |
| `tools/` | Reference validator, XML converter, XSD generator, tests |
| `registry/` | Open index of publisher feeds |

## Validate a document

```bash
cd tools && npm ci
node validate.mjs ../examples/dried-flower.feed.json
npm test
```

## Relationship to GS1

COSTA does not issue GTINs or replace barcodes; distributors require GS1 GTINs and COSTA uses them. COSTA is an open alternative to proprietary product-data syndication. See spec section 1.1.

## Contributing

Open an issue or pull request. Profile changes need a link to the public source. Core changes need an example and a test.

## License

MIT. See `LICENSE`.
