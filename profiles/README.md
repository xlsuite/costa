# Jurisdiction profiles

A profile is a named, versioned set of rules a product can declare in `conformsTo`. Rules in `ca-federal` are implemented in `tools/validate.mjs`. Provincial rules are data in these JSON files, read by the same validator.

| Profile | Status | Sources checked |
|---|---|---|
| `ca-federal/2.0` | Normative | 2026-11-02 |
| `ca-on-ocs/2.0` | Normative | 2026-11-02 |
| `ca-bc-bcldb/2.0` | Normative | 2026-11-02 |
| `ca-qc-sqdc/2.0` | Normative | 2026-11-02 |
| `ca-ab-aglc/2.0` | Provisional: AGLC LP Operations Manual v9.0 not yet reviewed | 2026-11-02 |

Not yet profiled: SK, MB, NS, NB, NL, PE, YT, NT, NU.

## Rule keys

| Key | Meaning |
|---|---|
| `requireLocales` | `name` must exist in these languages |
| `requireFields`, `requireFieldsByClass`, `requireFieldsByForm` | Dot paths that must be present |
| `requireGtinLevels` | Packaging levels that need an active GTIN |
| `requireProductPotencyRange` | `potency` ranges required at item setup |
| `requireDriedEquivalent` | `driedEquivalentGrams` required |
| `requireHealthCanadaNotice` | `identifiers.healthCanadaProductNotice` required |
| `requireListing` | Warn if no `jurisdictions[]` entry for this jurisdiction |
| `descriptionMaxLength` | Character limits for `descriptions.short` and `.long` |
| `minImages`, `requireMediaRoles` | Media requirements |
| `prohibitedClasses`, `prohibitedForms` | Products the jurisdiction does not sell |
| `maxThcMgPerGNonEdible`, `maxEdibleThcMgPerUnit`, `maxNonSolidEdibleThcMgPerContainer` | Provincial THC limits |
| `barcode.symbologies`, `barcode.requiredAIs`, `barcode.forbiddenAIs` | Barcode rules per packaging level. Barcodes with a `jurisdictions` list are checked only for those jurisdictions |
| `lotNumber.maxLength`, `lotNumber.forbiddenChars` | Lot number limits |
| `requireLabReportPerLot`, `labReportDocumentRequired` | COA rules |
| `freshness.groups`, `freshness.limitsDays` | Days since packaging before inbound refusal or quarantine (warnings) |
| `minShelfLifeDays` | Minimum days to expiry (warning) |

## BC LDB catalog field mapping

| BCLDB field | COSTA |
|---|---|
| SU_CODE / SHIP_CODE | `identifiers.gtins[]` (consumerUnit / case) |
| SU_PRODUCT_NET_SIZE(_UOM) | `netContent` |
| SU_NUMBER_OF_CONSUMER_ITEMS, SU_CONSUMER_ITEM_SIZE(_UOM) | `unitCount`, `unitNetContent` |
| SU_VOLUME_EQUIVALENCY | `driedEquivalentGrams` |
| SPECIES | `strain.plantType` |
| STRAIN | `strain.name` |
| EXTRACTION_PROCESS | `processing.extractionMethods` |
| PACKAGING_MATERIAL | `packaging.materials` |
| GROWING_METHOD | `cultivation.growingMethod` |
| TERPENE_1..3_TYPE | `terpenes.dominant[0..2]` |
| THC/CBD_TARGET_MIN/MAX (legacy) | `potency.totalThc` / `totalCbd` |
| PER_DISCRETE_UNIT_THC/CBD_MIN/MAX/UOM | `potency.totalThcPerUnit` / `totalCbdPerUnit` |
| PER_ACTIVATION_THC/CBD_MIN/MAX/UOM | `potency.totalThcPerActivation` / `totalCbdPerActivation` |
| PER_RETAIL_UNIT_THC/CBD_MIN/MAX/UOM | `potency.totalThc` / `totalCbd` (mg basis) |
| CATEGORY, SUBCATEGORY | `jurisdictions[].category`, `.subcategory` (CLASS, the third level, is not mapped yet) |
| BRAND_NAME | `brand.name` |
| BC_INDIGENOUS_PRODUCT | `jurisdictions[].indigenousProductProgram` |
| WSL_LIFECYCLE_STATUS | `jurisdictions[].status` |
