# Changelog

## 2.0.0-draft.1 (2026-11-02)

Breaking release. See spec section 14 for migration.

### Added
- Four document types: `CostaFeed`, `CostaProduct`, `CostaLot`, `CostaLabReport`.
- Permanent product identity (`costaId`), separate from the GTIN.
- GTIN assignments with validity windows, packaging levels, barcodes and retirement reasons; a normative GTIN resolution algorithm; `supersedes`/`supersededBy`.
- Lot records with labelled potency, QA release and recall status.
- Structured lab reports: laboratory accreditation, sample, panels, results with qualifiers and limits, document hash, revisions, visibility.
- Label-basis potency model matching the Cannabis Regulations as amended by SOR/2025-43 (Total THC/CBD; mg/g for dried and fresh cannabis).
- `intendedUse`, `edibleForm`, `discreteUnits`, `dispensingMechanism`, `driedEquivalentGrams`.
- Alignment table for the proposed Cannabis Tracking System Order amendment (Canada Gazette Part I, 2026-09-26).
- Jurisdiction profiles: `ca-federal`, `ca-on-ocs`, `ca-bc-bcldb`, `ca-qc-sqdc` (normative) and `ca-ab-aglc` (provisional).
- Jurisdiction-scoped barcode variants (for example OCS forbids AI 90 on cases; SQDC requires it).
- Reference validator, test suite with one invalid example per rule, generated XSD, JSON↔XML converter, JSON-LD context, CI workflow.
- Publisher discovery at `/.well-known/costa/feed.json`, feed sequence numbers, optional JWS signatures, open publisher registry.

### Changed
- `classOfCannabis` values now match Schedule 4 exactly (lowercase).
- `productForm` expanded from 10 to 30 values, each mapped to allowed classes.
- XML is now generated mechanically from the JSON model.

### Removed
- `thcPercent`/`cbdPercent` and all percentage potency fields. Dried cannabis labels have used mg/g since the 2019 amendments.
- `price`, `priceCurrency`, `availability` from the core record.
- `consumptionWarning`, `cannabisAccessRequirement`.

### Fixed
- v1.1 referenced `schemas/gocosta-v1.1.schema.json` and `.xsd`, which were never published. 2.0 ships real schemas, tested in CI.
- Spec footer said CC BY 4.0 while `LICENSE` is MIT. The spec now states MIT.

## 1.1 (October 2026)
- Seven Health Canada classes; potency by label basis; removed effect claims and approval claims.

## 1.0 (November 2025)
- Initial release.
