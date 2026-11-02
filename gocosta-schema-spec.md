# COSTA 2.0: Open Cannabis Product Data Standard

**Status:** Draft for public comment · **Version:** 2.0.0-draft.1 · **Date:** 2026-11-02 · **License:** MIT (see `LICENSE`)

The key words MUST, MUST NOT, SHOULD, SHOULD NOT and MAY are used as described in RFC 2119.

**Normative artifacts.** If this document and the files below disagree, the files win, and the disagreement is a bug to report:

| Artifact | Path | What it checks |
|---|---|---|
| JSON Schema (2020-12) | `schemas/costa-2.0.schema.json` | Structure, types, enumerations, patterns |
| Reference validator | `tools/validate.mjs` | Cross-field, regulatory and profile rules |
| Jurisdiction profiles | `profiles/*.json` | Provincial requirements |
| XML Schema | `schemas/costa-2.0.xsd` | XML structure (generated from the JSON Schema) |
| JSON-LD context | `schemas/costa-2.0.context.jsonld` | Linked-data mapping |

---

## 1. Purpose and scope

COSTA is an open, royalty-free standard for exchanging cannabis product master data, lot data and lab results between licensed producers, provincial distributors, retailers, software vendors and consumers. Each publisher hosts its own data, and any party can validate it with free tools.

**What COSTA covers**

- Product master data: identity, classification, label statements, potency ranges, attributes, media, provincial listings.
- Lot data: lot number, packaging date, the potency printed on that lot's label, QA release and recall status.
- Lab reports (certificates of analysis) as structured data, linked to lots.
- GTIN history, so a recycled or reassigned GTIN never resolves to the wrong product.
- Machine-checkable rules for Health Canada requirements and for each province's supplier requirements.

**What COSTA does not do**

- **COSTA does not issue GTINs or replace barcodes.** A GTIN is a GS1 identifier, and every provincial distributor requires GS1 GTINs and GS1 barcode symbologies. COSTA uses GTINs as published by their owners.
- COSTA does not replace any filing with Health Canada, the Cannabis Tracking System, or a provincial distributor's own forms (for example the OCS COA form). It is designed so those forms can be filled automatically from COSTA data.
- COSTA does not cover wholesale pricing, purchase orders, advance ship notices or inventory reporting.

### 1.1 Relationship to GS1

GS1 publishes open identification standards (GTIN, application identifiers, barcode symbologies), and COSTA builds on them. GS1 member organizations also sell product data services, such as GS1 Canada's ECCnet Registry and New Item Setup, which some provincial distributors currently require. COSTA is an open alternative to that **data syndication layer**, not to GS1 identification.

| Layer | GS1 | COSTA 2.0 |
|---|---|---|
| Product identifier (GTIN) | Issues and licenses | Uses; never issues |
| Barcode symbology and AIs | Defines | Records which barcode and AIs are printed |
| Product data model | Global Data Model plus cannabis attributes in a member service | Open schema, open validator, cannabis-first |
| Lab results | Not modelled | Structured COA linked to lots |
| Data hosting | Central registry, by subscription | Each publisher's own domain; optional open index |
| GTIN reuse | Prohibited from 2019, with exceptions | Modelled explicitly with validity windows (section 5) |

**Adoption note.** As of this draft, the OCS requires suppliers to obtain GTINs, barcodes, product images and ECCnet Registry listing through GS1 Canada. A producer selling in Ontario still has to meet that requirement. COSTA becomes a substitute for the data layer only when a distributor agrees to accept COSTA feeds. Section 11 lists what each profiled distributor currently requires.

---

## 2. Conformance

### 2.1 Conforming documents

A COSTA document is JSON that validates against `schemas/costa-2.0.schema.json` and is one of four types, identified by `@type`:

| `@type` | Purpose |
|---|---|
| `CostaFeed` | A publisher's set of products, lots and lab reports |
| `CostaProduct` | Master data for one trade item |
| `CostaLot` | One lot as packaged and labelled |
| `CostaLabReport` | One certificate of analysis |

Every document MUST carry `"costaVersion": "2.0"`.

### 2.2 Profiles

A **profile** is a named set of rules for a jurisdiction. Each product declares the profiles it meets in `conformsTo` (for example `["ca-federal/2.0", "ca-on-ocs/2.0"]`). A product that declares any Canadian provincial profile MUST also declare `ca-federal/2.0`.

| Profile | Jurisdiction | Status |
|---|---|---|
| `ca-federal/2.0` | Canada (Cannabis Act and Cannabis Regulations) | Normative |
| `ca-on-ocs/2.0` | Ontario (OCS) | Normative |
| `ca-bc-bcldb/2.0` | British Columbia (BC LDB Wholesale) | Normative |
| `ca-qc-sqdc/2.0` | Quebec (SQDC) | Normative |
| `ca-ab-aglc/2.0` | Alberta (AGLC) | **Provisional** |

**Normative** means every rule in the profile is traced to a published source listed in the profile file. **Provisional** means the profile is incomplete and MUST NOT be used to make listing decisions.

### 2.3 Validation levels

The reference validator reports **errors** and **warnings**. A document conforms to a profile when the validator reports no errors for it. Warnings flag things a human should review, such as possible promotional claims or a lot that is close to a provincial freshness limit.

---

## 3. Data model overview

```
CostaFeed
 ├─ publisher
 ├─ products[] ── CostaProduct ── identifiers.gtins[] (GTIN history)
 │                              ├─ potency (expected ranges)
 │                              ├─ jurisdictions[] (provincial listings)
 │                              └─ lots[] (optional, embedded)
 ├─ lots[] ────── CostaLot ── product → CostaProduct.costaId
 │                          ├─ labelledPotency (as printed)
 │                          └─ labReports[] → CostaLabReport.reportId
 └─ labReports[]─ CostaLabReport ── sample.lotNumber, panels[].results[]
```

Lots can be embedded in a product or listed at feed level. Lab reports are always separate documents, referenced by `reportId`, because they are issued by a different party (the lab) and may have different visibility.

**Empty arrays** are equivalent to an absent property. A publisher MUST NOT rely on an empty array to mean "none".

---

## 4. Product record

### 4.1 Identity

- `costaId` MUST be an `https` URI under a domain the publisher controls. It MUST be permanent, MUST NOT be reused for a different product, and SHOULD contain an opaque identifier (for example a UUID) rather than the GTIN or SKU.
- `costaId` is the product's identity. **The GTIN is not.** See section 5.
- `recordVersion` MUST increase by at least 1 whenever any field changes. `recordUpdated` is the UTC time of that change.
- A product record MUST NOT be deleted from a feed. To withdraw it, change `status`.

### 4.2 Status

| `status` | Meaning |
|---|---|
| `active` | Currently produced or sold |
| `discontinued` | No longer produced; existing stock may still be sold |
| `withdrawn` | Removed from the market, for example after a recall |
| `neverProduced` | GTIN allocated but the item never shipped. MUST NOT have lots |

### 4.3 Classification

COSTA classifies every product on three axes.

**1. `classOfCannabis` (regulatory class).** Required. One of the seven classes in Schedule 4 of the *Cannabis Act*, exactly as printed on the label:

`dried cannabis` · `fresh cannabis` · `cannabis plants` · `cannabis plant seeds` · `edible cannabis` · `cannabis extracts` · `cannabis topicals`

**2. `productForm` (consumer format).** Required. It MUST be compatible with the class:

| classOfCannabis | Allowed productForm values |
|---|---|
| dried cannabis | driedFlower, milledFlower, preRoll, infusedPreRoll |
| fresh cannabis | freshCannabis |
| cannabis plants | plant |
| cannabis plant seeds | seed |
| edible cannabis | gummy, chocolate, bakedGood, candy, beverage, beverageEnhancer, otherEdible |
| cannabis extracts | vapeCartridge, vapeDisposable, vapePod, concentrate, hash, kief, rosin, resin, oil, spray, capsule, infusedPreRoll, otherExtract |
| cannabis topicals | lotion, balm, bathProduct, otherTopical |

`infusedPreRoll` is allowed under both dried cannabis and cannabis extracts. The publisher MUST use the class printed on the label.

**3. Label-driving attributes.** These decide which statements the Cannabis Regulations require on the label:

- `discreteUnits` (required): the product is sold in units (pre-rolls, capsules, gummies).
- `intendedUse`: inhalation, ingestion, topical, nasal, rectal, vaginal or other. Required for extracts, topicals, and dried or fresh cannabis in discrete units. Edibles are always ingestion.
- `edibleForm`: solid, nonSolid or beverage. Required for edible cannabis only.
- `dispensingMechanism`: the container dispenses activations (metered sprays, dosing pens).

### 4.4 Alignment with the proposed Cannabis Tracking System Order amendment

The *Order Amending the Cannabis Tracking System Order (Streamlining of Requirements)*, pre-published in the *Canada Gazette*, Part I, on 2026-09-26, replaces the Order's two schedules (11 product classes and 14 unpackaged classes) with one schedule of seven classes:

| Proposed CTSO schedule class | Reporting unit | COSTA `classOfCannabis` |
|---|---|---|
| cannabis plant seeds | number of seeds | cannabis plant seeds |
| cannabis plants | number of plants | cannabis plants |
| fresh cannabis | kilograms | fresh cannabis |
| dried cannabis | kilograms | dried cannabis |
| edible cannabis | kilograms | edible cannabis |
| cannabis extract | kilograms | cannabis extracts |
| cannabis topical | kilograms | cannabis topicals |

The mapping is one-to-one, so a licence holder's monthly report can be aggregated directly from COSTA product and lot data.

The classes being merged can still be derived from COSTA attributes. This matters until the new schedule takes effect, and for any party that keeps the finer split:

| Former distinction | COSTA attribute |
|---|---|
| Solid vs non-solid edible cannabis | `edibleForm` (solid vs nonSolid or beverage) |
| The three extract classes (by route of use) | `intendedUse` |
| Pure intermediates | Not a packaged product; out of scope |
| Plants budding/flowering vs not | Not product data; out of scope |

Timing under the proposal: sections 1 to 3 and 7 of the Order would come into force on **2028-01-01**. Repeal of reporting by provincial bodies, distributors and retailers would take effect on publication in Part II. Comments are due 45 days after pre-publication, which is **2026-11-10**. The RIAS records a stakeholder request to harmonize federal and provincial reporting formats that was not adopted. COSTA is one way to meet that need without new regulation.

### 4.5 Net content and dried-cannabis equivalency

`netContent` is required. Its unit MUST be:

| Product | Unit |
|---|---|
| Plants, seeds | count |
| Edible cannabis, solid | g |
| Edible cannabis, nonSolid or beverage | mL |
| All other classes | g |

For products in discrete units, `unitCount` and `unitNetContent` are required.

`driedEquivalentGrams` gives the equivalent amount of dried cannabis under Schedule 3 of the *Cannabis Act*. It is required by `ca-bc-bcldb`. The validator checks it where the conversion is unambiguous:

| Schedule 3 class | Equivalent to 1 g dried cannabis |
|---|---|
| dried cannabis | 1 g |
| fresh cannabis | 5 g |
| solids containing cannabis | 15 g |
| non-solids containing cannabis, other than beverages | 70 g |
| cannabis concentrates | 0.25 g |
| cannabis beverages | 570 g |
| cannabis plant seeds | 1 seed |

### 4.6 Potency

#### 4.6.1 Label basis

COSTA carries potency **in the same basis and unit the label must use**. Under the Cannabis Regulations as amended by SOR/2025-43, labels show only "Total THC" and "Total CBD", which include the potential conversion of THCA and CBDA. Dried cannabis is labelled in **mg/g, not percent**.

| Product | Required statements | Unit | Regulation |
|---|---|---|---|
| Dried or fresh, not discrete | totalThc, totalCbd | mg/g | s. 125 |
| Dried or fresh, discrete, for inhalation (pre-rolls) | totalThc, totalCbd | mg/g | s. 124.1 |
| Dried or fresh, discrete, not for inhalation | totalThcPerUnit, totalCbdPerUnit | mg | s. 124 |
| Extract, discrete, not for inhalation (capsules) | totalThcPerUnit, totalCbdPerUnit | mg | s. 132.1 |
| Extract, discrete, for inhalation | totalThc, totalCbd | mg/g | s. 132.11 |
| Extract, not discrete (oils, vapes, concentrates) | totalThc, totalCbd | mg/g | s. 132.12 |
| ... with a dispensing mechanism, not for inhalation | add totalThcPerActivation, totalCbdPerActivation | mg | s. 132.12(1)(f) |
| Topical, discrete | totalThcPerUnit, totalCbdPerUnit | mg or mg/g | s. 132.15 |
| Topical, not discrete | totalThc, totalCbd | mg or mg/g | s. 132.16 |
| Edible, discrete | totalThc, totalCbd, totalThcPerUnit, totalCbdPerUnit | mg | s. 132.18 |
| Edible, not discrete | totalThc, totalCbd | mg | s. 132.19 |
| Plants, seeds | none | | s. 128-129 |

Statements that do not apply to a product type MUST NOT be supplied.

#### 4.6.2 Product ranges and lot values

- `CostaProduct.potency` holds the **expected range** across lots (`min`, `max`, `unit`). Distributors set this at item setup and most require notice when a lot falls outside it.
- `CostaLot.labelledPotency` holds the **exact value printed on that lot's label** (`value`, `unit`).

Percentages are not a COSTA unit. To convert from % w/w, multiply by 10 to get mg/g.

#### 4.6.3 Total THC

Where a lab reports THC and THCA, Total THC = THC + 0.877 × THCA (and the same for CBD and CBDA). 0.877 is the ratio of the molecular weights of THC and THCA.

#### 4.6.4 THC limits checked by the validator

| Rule | Limit | Regulation |
|---|---|---|
| Edible cannabis, per immediate container | 10 mg THC | s. 102.7, 132.18(2), 132.19(2) |
| Discrete units for ingestion, nasal, rectal or vaginal use (not edibles) | 10 mg THC per unit | s. 96, 124(2), 132.1(2) |
| Per activation, ingested or similar use | 10 mg THC | s. 132.12(2) |
| Extracts and topicals, per immediate container | 1000 mg THC | s. 101.2 |

### 4.7 Other attributes

| Group | Fields | Notes |
|---|---|---|
| `cannabinoidsOther` | analyte, unit, min, max | CBG, CBN, THCV, etc. |
| `terpenes` | dominant (top 5), typical ranges, terpeneSource | terpeneSource distinguishes same-strain cannabis terpenes from botanical blends |
| `strain` | name, plantType, lineage, singleStrain | plantType: indica, indicaDominant, hybrid, sativaDominant, sativa, blend, unspecified |
| `cultivation` | growingMethod, growingMedium, cultivatedIn, organicCertification, dryingMethod, trimMethod, irradiated | cultivatedIn uses ISO 3166-2 codes |
| `processing` | extractionMethods, solventsUsed, solventless, carrierOil, fullSpectrum | Drives the residual-solvents check |
| `ingredients`, `allergens`, `flavour` | | Allergens use Health Canada's priority allergen list, gluten and sulphites |
| `preRoll` | paperType, filterType, shape, infused | |
| `device` | format, platform, batteryIncluded, rechargeable, hardwareCertifications | The OCS requires UL 8139, UL 1642, CAN/CSA-E62133 and UN/DOT 38.3 for vape hardware |
| `packaging` | childResistant, containerType, materials | |
| `storageConditions` | | Label statement under s. 123(1)(c)(iii) |

All text that may appear to consumers is a `LocalizedText` object with `en` and/or `fr` keys.

### 4.8 Descriptions and media

- `descriptions.short` and `descriptions.long` are `LocalizedText`. The OCS limits them to 200 and 1000 characters.
- `media[]` items have a `url`, a `role` (front, back, productOut, labelArtworkImmediate, labelArtworkOutermost, etc.), and optionally the `gtin` they depict and a `sha256`. Label artwork is included because distributors ask for flat label files at item setup.

### 4.9 Jurisdiction listings

`jurisdictions[]` records where the product is submitted or listed: the ISO 3166-2 `jurisdiction`, the `authority`, `status`, and the `category` and `subcategory` **as assigned by that authority**. COSTA does not define provincial category trees, because they differ between provinces and change without notice. Provincial SKUs go in `identifiers.jurisdictionSkus[]`.

---

## 5. Identifiers and GTIN lifecycle

### 5.1 Principle

**A GTIN is a lookup key, never a primary key.** Every system consuming COSTA data MUST key products by `costaId`. A GTIN MAY be used to find candidate products. It MUST NOT be used on its own to decide which product a scanned item or a sales record refers to.

### 5.2 Normalization

- GTINs MUST be stored as 14 digits. GTIN-8, GTIN-12 (UPC-A) and GTIN-13 are left-padded with zeros.
- The check digit MUST be valid (GS1 mod-10). The validator rejects invalid check digits.

### 5.3 GTIN assignments

`identifiers.gtins[]` lists every GTIN the product has used, each with:

- `packagingLevel`: consumerUnit, innerPack or case. Each level has its own GTIN; `childGtin` and `childQuantity` describe the hierarchy.
- `validFrom` (required) and `validThrough`: the period during which the GTIN identified this product. `validThrough` is null while active and required once retired.
- `status` (active or retired) and `retiredReason`.
- `gs1CompanyPrefix`: the prefix the GTIN was allocated from.
- `barcodes[]`: symbology and application identifiers printed. A barcode variant MAY be limited to specific `jurisdictions` when provinces require different case labels (section 11).

Assignment windows for the same GTIN MUST NOT overlap, either within one product or across products. Overlap is an error (`gtin-conflict`). Non-overlapping use of the same GTIN by different products is a warning (`gtin-reuse`) and is resolved by the algorithm in 5.4.

### 5.4 Resolution algorithm (normative)

Input: a GTIN, and where available the lot number (AI 10) and packaging date (AI 13) from the barcode, or the date of the transaction.

1. Normalize the GTIN to 14 digits and verify the check digit. If invalid, stop: **unresolved**.
2. Collect every product, from every trusted feed, with an assignment for that GTIN.
3. If a lot number is available, keep products that have a lot with that `lotNumber` and `gtin`. If exactly one remains: **resolved**.
4. Otherwise, using the packaging date (or else the transaction date), keep products whose assignment window contains that date. If exactly one remains: **resolved**.
5. If none remain: **unresolved**. If more than one remains: **conflict**.

On **conflict**, a consumer MUST NOT merge the records or pick one silently. It SHOULD rank candidates by:

1. The publisher's domain is listed in the COSTA registry (section 10.4) for the GTIN's company prefix, and the GS1 licensee of that prefix can be confirmed out of band.
2. The product's `licenceHolder` matches the licence holder printed on the package.
3. The most recent `validFrom`.

It SHOULD then send the conflict to a person for review.

### 5.5 Why GTINs get reused

GS1's non-reuse rule took effect on 2019-01-01: an allocated GTIN shall not be reallocated to another trade item (GS1 General Specifications 4.3.5; GSCN 18-120). Reuse still happens in practice:

| Case | GS1 position | COSTA handling |
|---|---|---|
| GTIN allocated but item never produced | May be reused 12 months after deletion from the catalogue | `status: neverProduced` on the old record; windows do not overlap |
| GTIN withdrawn before 2019-01-01 | May be reused one final time | Windows do not overlap; resolve by date |
| Product withdrawn, then reintroduced unchanged | Same GTIN allowed | Same `costaId`, new assignment window or the existing window extended |
| Division or brand sold | Seller must not reuse the numbers for 4 years | Buyer's record `supersedes` the seller's, with reason `licenceHolderChange` |
| Producer error, or GTINs bought from unlicensed resellers | Non-compliant | Detected as `gtin-conflict` or `gtin-prefix` warnings |
| Licence holder insolvent; assets and brands sold on | Prefix and GTIN status may be unclear | Explicit windows and `supersedes` keep the history traceable |

### 5.6 Supersession

When a change requires a new GTIN (new formulation, net content, class, brand or licence holder), the publisher creates a **new** product with a new `costaId` and lists the old one in `identifiers.supersedes[]` with a `reason`. The old record gets `supersededBy` and a retired assignment. A label redesign that does not change the trade item keeps the same `costaId` and GTIN.

### 5.7 Other identifiers

- `identifiers.healthCanadaProductNotice.noticeId`: the new cannabis product notice. Required by `ca-qc-sqdc`.
- `identifiers.sku`: the publisher's internal SKU.
- `identifiers.jurisdictionSkus[]`: SKUs assigned by provincial distributors.
- `licenceHolder.healthCanadaLicenceNumber`: the producer's licence.

---

## 6. Lots

| Field | Rule |
|---|---|
| `lotNumber` | Required. 1 to 20 characters from the GS1 AI (10) character set, so it can be encoded in a barcode. Profiles can restrict this further (the OCS rejects `\ @ # $ ^ { } [ ] ( ) / % "`). |
| `gtin` | Required. MUST be a consumerUnit GTIN of the product, valid on `packagingDate`. |
| `packagingDate` | Required (s. 123(1)(c)(iv)). MUST NOT be in the future. Encoded in barcodes as AI (13) YYMMDD. |
| `expiryDate` | Optional. MUST NOT be present for edible cannabis (s. 123.02(2)). For other classes, allowed only with stability data on file (s. 123.02(1)); set `stabilityDataOnFile: true`. |
| `labelledPotency` | Required. The values printed on this lot's label (section 4.6). |
| `labReports[]` | References to lab reports, each with `scope` (finalForm, inputCannabis, inProcess) and optionally the `sha256` of the report document. |
| `qaRelease` | Date the quality assurance person approved the lot for sale (s. 88(1)(e)). |
| `recall` | Recall status, date, class and notice URL. |

---

## 7. Lab reports

### 7.1 Structure

A `CostaLabReport` represents one certificate of analysis:

- `reportNumber`, `revision`, and `supersedes` (the `reportId` of the revision it replaces). A corrected COA MUST be a new report that supersedes the old one, never an edit in place.
- `laboratory`: legal name, Health Canada licence number, and `accreditations[]` (standard, body, certificate number, scope URL, expiry). Distributors expect ISO/IEC 17025.
- `client`: the licence holder that submitted the sample.
- `sample`: sample ID, lot number, GTIN, product, `sampleType` (finalForm, inputCannabis, inProcess), matrix, collection and receipt dates.
- `analysisStarted`, `analysisCompleted`, `issuedDate`, `authorizedBy`.
- `panels[]`: one per test (potency, terpenes, microbial, mycotoxins, heavyMetals, pesticides, residualSolvents, moisture, waterActivity, foreignMatter, dissolution, disintegration, homogeneity, other). Each panel has a `method` (ID, reference, technique, validated) and a `status` (pass, fail, informational, notTested).
- `results[]` per panel: `analyte`, optional `casNumber`, `qualifier` (`=`, `<LOQ`, `<LOD`, `ND`, `>ULOQ`), `value`, `unit`, `loq`, `lod`, `limit`, `limitType`, `uncertainty`, `conforms`.
- `overallConformance`, `document` (URL, media type, **sha256**, pages), `visibility`.

### 7.2 Federal testing requirements

| Requirement | Regulation | Validator rule |
|---|---|---|
| THC, THCA, CBD and CBDA tested on every lot, in final form | s. 90 | Final-form report must include all four analytes |
| Microbial and chemical contaminants tested | s. 91 | Final-form report must have microbial and heavyMetals panels; mycotoxins missing is a warning |
| Residual solvents | s. 91 | Required when extraction used ethanol, hydrocarbon or another solvent |
| Dissolution or disintegration | s. 91.1, 95 | Required for discrete units for ingestion, nasal, rectal or vaginal use (not edibles) |
| Validated methods; representative sample; retained sample | s. 92 | `method.validated` recorded |

### 7.3 Consistency checks

- **Total THC/CBD:** if the report gives THC, THCA and Total THC, Total THC MUST equal THC + 0.877 × THCA within 1% (or 0.05 units).
- **Label vs lab:** the validator converts the measured final-form total into the label's unit (using net content and unit count where needed) and compares it with `labelledPotency`, using the permitted variability in s. 97:

| Product | Labelled amount | Measured must be within |
|---|---|---|
| Extracts and topicals | any | 85% to 115% |
| Edibles | > 5 mg | 85% to 115% |
| Edibles | > 2 mg to 5 mg | 80% to 120% |
| Edibles | ≤ 2 mg | 75% to 125% |
| Dried and fresh cannabis | any | No regulatory tolerance. A difference over 20% is a warning |

- **Dates:** collected ≤ received ≤ analysis started ≤ analysis completed ≤ issued.
- **Conformance:** a failing result or panel cannot sit under an overall `pass`. A lot that references a failed report is an error.

### 7.4 Integrity and confidentiality

- `document.sha256` is the SHA-256 of the signed PDF (or other document). A lot's reference MAY repeat the hash, and the validator checks they match. This lets anyone confirm the structured data and the PDF describe the same report.
- `visibility` is `public`, `tradePartners` or `restricted`. COAs are commercially sensitive. A publisher MAY put `tradePartners` and `restricted` reports behind authentication; the feed then includes the reference and hash but not the report itself.

### 7.5 Provincial COA requirements

| Distributor | When | Format |
|---|---|---|
| OCS | Every lot, at least 72 hours before it arrives at the DC | OCS COA form; COSTA data can fill it |
| SQDC | First lot before first shipment; later lots on request | Uploaded file |
| BC LDB | Not stated in the registration guide reviewed | |

---

## 8. Content rules

COSTA data shown to consumers is promotion under the *Cannabis Act*. Publishers MUST NOT include:

- health, therapeutic, cosmetic or effect claims (relaxing, sleep, pain relief, energizing, creativity);
- testimonials, endorsements, ratings, reviews or superlatives ("best", "award-winning");
- lifestyle content, or content appealing to young persons;
- association with alcohol or tobacco;
- claims that Health Canada approved the product.

The OCS also rejects casual terms ("weed", "pot", "stoner"). The validator flags likely violations as warnings; a person must make the final call.

---

## 9. Serialization

### 9.1 JSON (normative)

JSON is the normative wire format. Documents MUST be UTF-8 and MUST validate against `schemas/costa-2.0.schema.json`. Dates are `YYYY-MM-DD`; timestamps are RFC 3339 in UTC.

### 9.2 JSON-LD

Documents SHOULD include `"@context": "https://gocosta.org/ns/costa-2.0.jsonld"` (source: `schemas/costa-2.0.context.jsonld`). The context maps `costaId`, `lotId` and `reportId` to `@id`, maps `name`, `brand`, `sku` and `gtin` to schema.org, and treats `LocalizedText` as language maps.

**Product pages.** For search engines, a product page SHOULD embed a plain schema.org `Product` (name, brand, `gtin14`, image, url) and link to the authoritative COSTA record:

```html
<link rel="alternate" type="application/costa+json" href="https://producer.example/costa/products/3f2a9c1e-...">
```

Do not put ratings, reviews or effect language in either.

### 9.3 XML

XML is supported for systems that need it. The mapping is mechanical, so the JSON Schema stays the single source of truth:

- The root element is the document's `@type`, in namespace `https://gocosta.org/ns/2.0`.
- Each JSON property becomes a child element with the same name, in the order the properties appear in the JSON Schema.
- An array becomes the element repeated once per item.
- `null` values, empty arrays, `@context` and `@id` are omitted.
- `extensions` become `<extension key="prefix:name">value</extension>`.

`schemas/costa-2.0.xsd` is **generated** from the JSON Schema by `tools/gen-xsd.mjs` and MUST NOT be edited by hand. CI fails if it is stale. The XSD checks structure, types, enumerations, patterns and cardinality only. Regulatory and cross-field rules require the reference validator, which XML documents can reach by converting with `tools/json2xml.mjs --to-json`. Every example is round-tripped JSON → XML → JSON in the test suite.

### 9.4 Extensions

Publisher-specific data goes in `extensions`, with keys in the form `prefix:name`. Consumers MUST ignore extension keys they do not understand. Extensions MUST NOT be used for data that a COSTA field already covers.

---

## 10. Publishing and discovery

### 10.1 Feed location

A publisher SHOULD serve its feed at `https://{domain}/.well-known/costa/feed.json`. Large feeds MAY be paged with `nextPage`.

### 10.2 Change detection

`sequence` MUST increase every time the feed changes. A consumer MUST ignore a feed whose `sequence` is lower than one it has already processed. Within a feed, consumers use `recordVersion` to detect changed products.

### 10.3 Signatures (recommended)

A publisher SHOULD publish a JSON Web Key Set at `publisher.jwksUrl` and serve a detached JWS (RFC 7515) over the RFC 8785 canonical form of the feed at `feed.json.jws`. This proves the feed came from the domain owner and was not altered by an aggregator.

### 10.4 Registry

The COSTA repository keeps an open index (`registry/publishers.json`) mapping GS1 company prefixes and Health Canada licence numbers to feed URLs. Entries are added by pull request. The index only helps consumers find feeds; it is not a data store.

### 10.5 Barcodes do not carry COSTA links

The Canadian cannabis industry's GS1 DataMatrix agreement limits on-pack barcode data to GTIN, lot and packaging date. COSTA therefore does not rely on a URL in the barcode (GS1 Digital Link or AI 8200). Scanners resolve the scanned GTIN and lot through section 5.4.

---

## 11. Jurisdiction profiles

Summary of profiled requirements. The profile files hold the machine-readable rules and their sources.

| | Ontario (OCS) | British Columbia (BC LDB) | Quebec (SQDC) | Alberta (AGLC) |
|---|---|---|---|---|
| Profile status | Normative | Normative | Normative | Provisional |
| GTINs required | Unit and case | Unit and case | Unit and case | Unit and case |
| GS1 Canada mandated | GTINs, barcodes, images, ECCnet | GS1 formats | GS1-conformant barcodes; certificate on request | Not yet reviewed |
| Consumer barcode | DataMatrix or DataBar Expanded (Stacked) with AIs 01, 10, 13 | Same, with AIs 01, 10, 13 | Same, with AIs 01, 13, 10 | Same, with AIs 01, 10, 13 |
| Case barcode | GS1-128 (AIs 01, 10); ITF-14, UPC-A or EAN-13 allowed; **AI (90) forbidden** | GS1-128 with AIs 01, 10, 13 | GS1-128 with AIs 01, 13, 10 and **(90) quantity required** | GS1-128 |
| Lot number | ≤ 20 characters; no `\ @ # $ ^ { } [ ] ( ) / % "` | | | |
| COA | Every lot, OCS form, 72 h before DC receipt | | First lot; later on request | |
| Language | English required; French recommended | English | **French required**; at least as prominent | English |
| Product restrictions | | | No topicals; no candy, chocolate or desserts; no vapes; ≤ 5 mg THC per edible unit; ≤ 5 mg per liquid edible container; ≤ 30% THC (300 mg/g) in non-edibles | |
| Other required data | Potency ranges; plant type and strain (dried); extraction method (extracts); device format (vapes); label artwork | Dried equivalency; plant type; growing method; packaging materials; top terpenes; extraction method | Health Canada product notice ID; label artwork | |
| Freshness | Inbound and quarantine limits by category (e.g. dried flower 4 and 9 months from packaging) | | Dried flower and pre-rolls ≤ 9 months; ≥ 90 days shelf life | |

**Cross-province conflicts are expected.** The OCS forbids AI (90) on case labels and the SQDC requires it. COSTA handles this with jurisdiction-scoped barcode variants (section 5.3); see `examples/edible-gummy.feed.json`.

**Not yet profiled:** Saskatchewan, Manitoba, Nova Scotia, New Brunswick, Newfoundland and Labrador, Prince Edward Island, Yukon, Northwest Territories and Nunavut. All thirteen provincial and territorial wholesalers have accepted the GS1 DataMatrix since 2025-09-01, so the barcode rules in `ca-ab-aglc` are a reasonable starting point. Products for these jurisdictions SHOULD declare `ca-federal/2.0` only until a profile exists.

---

## 12. Validation

```bash
cd tools && npm ci
node validate.mjs --as-of 2026-11-02 ../examples/dried-flower.feed.json
npm test        # all examples, invalid cases, XSD, XML round trips
```

`examples/invalid/` contains one document per rule, with the rule IDs each must trigger listed in `expected.json`.

---

## 13. Versioning and governance

- The standard uses semantic versioning. Breaking changes require a new major version. Profiles are versioned separately (`ca-on-ocs/2.0`, `ca-on-ocs/2.1`) because provincial rules change more often than the core.
- Every normative profile rule MUST cite a public source with the date it was checked.
- Changes are proposed as GitHub issues or pull requests. A profile change needs a source link. A core change needs an example and a test.

---

## 14. Migrating from v1.1

| v1.1 | v2.0 |
|---|---|
| `cannabis` object inside a schema.org Product | Top-level `CostaProduct` document |
| `gtin` (string) | `identifiers.gtins[]` with validity windows, packaging levels and barcodes |
| `"Dried cannabis"` (capitalized) | `"dried cannabis"` (as in Schedule 4) |
| `thcPercent`, `cbdPercent` | `potency.totalThc` / `totalCbd` in **mg/g** (multiply % by 10) |
| `thcTotalMg`, `cbdTotalMg` | `potency.totalThc` / `totalCbd` in mg (edibles) |
| `thcConcentration` | `potency.totalThc` in mg/g |
| `thcPerUnitMg` | `potency.totalThcPerUnit` |
| `strainType` | `strain.plantType` |
| `batchLotNum`, `expiryDate` | `CostaLot.lotNumber`, `CostaLot.expiryDate` |
| `testing` booleans and `testResultsUrl` | `CostaLabReport` with panels and results |
| `price`, `availability` | Removed from the core. Prices differ by province and channel; use schema.org `Offer` on product pages |
| `consumptionWarning` | Removed. Health warnings are fixed by regulation and are not product data |
| `cannabisAccessRequirement` | Removed |
| `productForm` (10 values) | `productForm` (30 values), plus `intendedUse`, `discreteUnits`, `edibleForm` |

---

## Appendix A. Sources

- *Cannabis Act*, S.C. 2018, c. 16, Schedules 3 and 4. https://laws-lois.justice.gc.ca/eng/acts/C-24.5/
- *Cannabis Regulations*, SOR/2018-144, consolidated to 2026-09-30. https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-144/
- *Order Amending the Cannabis Tracking System Order (Streamlining of Requirements)*, Canada Gazette Part I, Vol. 160, No. 39 (2026-09-26). https://gazette.gc.ca/rp-pr/p1/2026/2026-09-26/html/reg1-eng.html
- GS1 GSCN 18-120, GTIN non-reuse. https://ref.gs1.org/standards/genspecs/gscn/2018/GSCN-18-120_GTIN_Reuse.pdf
- GS1 Canada, GS1 DataMatrix FAQ for the Canadian cannabis community. https://gs1ca.org/gs1ca-components/documents/Cannabis-GS1-DataMatrix-FAQ-en.pdf
- OCS Supplier Manual (2023), Product Description Guidelines (2025), Barcode Standards, GS1 requirements. https://doingbusinesswithocs.ca/
- BC LDB Wholesale Cannabis Product Registration Guide and Product Catalog Definitions (2026-06). https://www.bcldb.com/bcldb-cannabis-supplier-information
- SQDC Supplier's Guide (2024-02) and Guide de création d'un nouveau produit (2024-08). https://www.sqdc.ca/

## Changelog

See `CHANGELOG.md`.
