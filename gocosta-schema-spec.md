# GoCosta Cannabis Product Schema v1.1
## Technical Specification & Implementation Guide

---

## 1. Overview

GoCosta is an open, decentralized standard for marking up cannabis product data using JSON-LD and XML. This specification enables licensed cannabis producers and brands to host standardized, machine-readable product information directly on their websites without requiring a central authority.

**Key Principles:**
- **Decentralized:** Data is hosted and managed by each producer on their own domain.
- **Open:** Built on schema.org extensions and widely adopted web standards.
- **Consumer-Centric:** Supports transparency around cannabinoid content, terpenes, and regulatory compliance, without health or effect claims.
- **Interoperable:** Dispensaries, aggregators, and search engines can consume this data consistently.
- **Regulatory-Aware:** Aligns with Canadian, U.S., and emerging state/provincial cannabis regulations.

---

## 2. Core Product Attributes

### 2.1 Basic Product Information
- **sku** (string, required): Internal stock keeping unit (e.g., "LP-OG-KUSH-FLOWER-3.5G")
- **gtin** (string, optional): Global Trade Item Number; recommended if using GS1 barcodes
- **name** (string, required): Product name (e.g., "OG Kush Dried Flower")
- **brand** (string, required): Producer/brand name (e.g., "Heritage Cannabis Co.")
- **url** (URL, required): Canonical product page URL
- **image** (URL array, required): Product photos (primary + secondary angles)
- **description** (string, required): Short product description

### 2.2 Cannabis-Specific Attributes

#### Cannabinoid Profile

Report cannabinoid content the same way it appears on the product's Health Canada-compliant label. Which fields are required depends on `classOfCannabis`:

| classOfCannabis | Required potency fields | Label basis |
|---|---|---|
| Dried cannabis, Fresh cannabis | `thcPercent`, `cbdPercent` | % w/w |
| Edible cannabis | `thcTotalMg`, `cbdTotalMg` | mg per container |
| Cannabis extracts, Cannabis topicals | `thcConcentration`, `cbdConcentration` | mg/g or mg/mL |
| Cannabis plants, Cannabis plant seeds | none | n/a |

- **thcPercent** (number, conditional): Total THC as a percentage, w/w (e.g., 18.5)
- **cbdPercent** (number, conditional): Total CBD as a percentage, w/w (e.g., 0.1)
- **thcRangeMin** / **thcRangeMax** (number, optional): Total THC range in %, w/w, if the label shows a range
- **thcTotalMg** / **cbdTotalMg** (number, conditional): Total THC / CBD in the whole package, in mg
- **thcConcentration** / **cbdConcentration** (object, conditional): Concentration as shown on the label
  - value: number
  - unit: "mg/g" or "mg/mL"
- **thcPerUnitMg** / **cbdPerUnitMg** (number, optional): mg per discrete unit (one gummy, one capsule) or per stated serving (see `servingSize`)
- **cannabinoidOther** (array of objects, optional): Other cannabinoids (CBN, CBG, THCV, etc.)
  - name: Cannabinoid name
  - percent: Percentage content

#### Strain & Genetics
- **strainName** (string, optional): Strain identifier (e.g., "OG Kush"). Recommended for dried cannabis, pre-rolls and single-strain extracts
- **strainType** (enum, optional): "Indica", "Sativa", "Hybrid"
- **strainLineage** (array, optional): Parent strain names

#### Terpene Profile
- **terpeneDominant** (array of strings, optional): Top 3–5 dominant terpenes (e.g., ["Myrcene", "Limonene", "Caryophyllene"])
- **terpeneProfile** (array of objects, optional): Detailed terpene breakdown
  - name: Terpene name
  - percent: Percentage

#### Product Form & Packaging
- **productForm** (enum, required): "Dried Flower", "Pre-Roll", "Vape Cartridge", "Edible", "Beverage", "Topical", "Concentrate", "Oil", "Capsule", "Tincture"
- **packageSize** (string, required): Package quantity with unit (e.g., "3.5g", "10 pack", "30ml")
- **packageWeightGrams** (number, optional): Total weight in grams
- **packageCount** (number, optional): Number of units if applicable (e.g., 10 for pre-rolls)
- **servingSize** (string, optional): The serving or unit that `thcPerUnitMg` refers to (e.g., "1 gummy", "0.5 mL")

### 2.3 Regulatory & Compliance Data

#### Health Canada / Regulatory
- **classOfCannabis** (enum, required for Canada): The Health Canada class of cannabis, as listed in Schedule 4 of the *Cannabis Act*. Must be exactly one of:
  - "Dried cannabis"
  - "Fresh cannabis"
  - "Cannabis plants"
  - "Cannabis plant seeds"
  - "Edible cannabis"
  - "Cannabis extracts"
  - "Cannabis topicals"

  These are the seven classes that remain after the October 2019 amendments, and they match the classes in the proposed consolidated schedule to the Cannabis Tracking System Order (*Canada Gazette*, Part I, 2026-09-26). See section 2.6 for how `productForm` maps to class.
- **healthCanadaLicenseNum** (string, optional): License number of producer
- **expiryDate** (ISO 8601 date, optional): Expiration or best-by date (YYYY-MM-DD)
- **batchLotNum** (string, optional): Batch or lot number for traceability

#### Testing & Certification
- **testedForContaminants** (boolean, optional): Whether product is tested
- **testingLabName** (string, optional): Name of testing lab
- **testResultsUrl** (URL, optional): URL to full test report or COA (Certificate of Analysis)
- **pesticidesDetected** (boolean, optional): Pesticide screening result
- **heavyMetalsDetected** (boolean, optional): Heavy metals screening result
- **microbialContaminationDetected** (boolean, optional): Microbial screening result
- **residualSolvents** (boolean, optional): Residual solvent testing result

### 2.4 Pricing & Availability
- **price** (string, required): Price in local currency (e.g., "12.99")
- **priceCurrency** (enum, required): "CAD" or "USD"
- **availability** (enum, required): "InStock", "OutOfStock", "PreOrder"
- **availabilityUrl** (URL, optional): Link to check stock at specific dispensary

### 2.5 Regulatory Disclosure (Canada-specific)
- **consumptionWarning** (string, optional): Warning text as it appears on the label. This does not replace the mandatory Health Canada health warning message on the package
- **allergens** (array of strings, optional): List of allergens (e.g., ["Tree Nuts", "Sulfites"])
- **cannabisAccessRequirement** (enum, optional): "AdultUse", "MedicalOnly", "RecreationalAndMedical"

  The minimum legal age is set by the province or territory of sale (18, 19 or 21), not by the product, so GoCosta does not encode it. Consumers of the data apply the age rule for their own jurisdiction.

### 2.7 Content Rules (Canada)

GoCosta data is promotion under the *Cannabis Act* when it is displayed to consumers. To keep feeds safe for every consumer of the data:
- **No health, therapeutic or effect claims.** Do not describe products or terpenes as relaxing, energizing, sleep-inducing, pain-relieving, anti-inflammatory, etc. GoCosta v1.1 removed `dominantEffect` and terpene `effectCategory` for this reason.
- **No testimonials or endorsements.** Do not include `aggregateRating` or `review` in GoCosta markup for products sold in Canada.
- **No approval claims.** Health Canada licenses producers; it does not approve individual adult-use products. GoCosta v1.1 removed `healthCanadaApprovedInd`.
- **Label is the source of truth.** Class, potency and warnings must match the product's Health Canada-compliant label.

The validator (`schemas/gocosta-v1.1.schema.json`) rejects documents that include the removed fields.

### 2.6 Product Form to Class of Cannabis Mapping

`classOfCannabis` is a regulatory classification; `productForm` is a consumer-facing format. Use this table to pick the correct class. Validators will reject combinations that don't match.

| productForm | classOfCannabis | Notes |
|---|---|---|
| Dried Flower | Dried cannabis | |
| Pre-Roll | Dried cannabis | For infused pre-rolls, use the class printed on the product label |
| Vape Cartridge | Cannabis extracts | Includes disposable vapes and pods |
| Concentrate | Cannabis extracts | Shatter, rosin, resin, hash |
| Oil | Cannabis extracts | Ingestible oils and sprays |
| Tincture | Cannabis extracts | |
| Capsule | Cannabis extracts | Ingestible capsules are extracts, not edibles |
| Edible | Edible cannabis | Gummies, chocolates, baked goods |
| Beverage | Edible cannabis | |
| Topical | Cannabis topicals | Lotions, balms, bath products |

"Fresh cannabis", "Cannabis plants" and "Cannabis plant seeds" have no matching `productForm` value in v1.1; producers selling these should use the class and describe the product in `description`.

**Rule of thumb:** the class must match the class printed on the product's Health Canada-compliant label. If the two disagree, the label wins.

### Deprecated values (v1.0)

The following v1.0 values are no longer valid. Map them as shown:

| v1.0 value | v1.1 value |
|---|---|
| "Cannabis (dried)" | "Dried cannabis" |
| "Cannabis (fresh)" | "Fresh cannabis" |
| "Cannabis oil" | "Cannabis extracts" (or "Edible cannabis" if the product is a food or beverage) |
| "Cannabis" | Use the specific class from the table above |

---

## 3. JSON-LD Schema Example

### Standard JSON-LD Structure

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "@id": "https://producer.ca/products/og-kush-35g",
  "name": "OG Kush Dried Flower",
  "brand": {
    "@type": "Brand",
    "name": "Heritage Cannabis Co.",
    "url": "https://heritagecannabisinc.ca"
  },
  "sku": "HC-OGK-FLOWER-3.5G",
  "gtin": "00627365491234",
  "url": "https://producer.ca/products/og-kush-35g",
  "image": [
    "https://producer.ca/images/og-kush-front.jpg",
    "https://producer.ca/images/og-kush-side.jpg",
    "https://producer.ca/images/og-kush-back.jpg"
  ],
  "description": "Premium OG Kush dried flower with a bold citrus and pine profile. Hand-trimmed and cured for optimal potency and flavor.",
  "offers": {
    "@type": "Offer",
    "url": "https://producer.ca/products/og-kush-35g",
    "priceCurrency": "CAD",
    "price": "12.99",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Heritage Cannabis Co."
    }
  },
  "cannabis": {
    "@type": "CannabisProduct",
    "cannabinoidProfile": {
      "thcPercent": 18.5,
      "cbdPercent": 0.1,
      "cannabinoidOther": [
        {
          "name": "CBN",
          "percent": 0.3
        },
        {
          "name": "CBG",
          "percent": 0.5
        }
      ]
    },
    "strain": {
      "name": "OG Kush",
      "type": "Hybrid",
      "lineage": ["Hindu Kush", "Chemdawg"]
    },
    "terpeneProfile": {
      "dominant": ["Myrcene", "Limonene", "Caryophyllene"],
      "detailed": [
        {
          "name": "Myrcene",
          "percent": 0.8
        },
        {
          "name": "Limonene",
          "percent": 0.6
        },
        {
          "name": "Caryophyllene",
          "percent": 0.5
        }
      ]
    },
    "productForm": "Dried Flower",
    "packageSize": "3.5g",
    "packageWeightGrams": 3.5,
    "classOfCannabis": "Dried cannabis",
    "healthCanadaLicenseNum": "LC0001234567",
    "expiryDate": "2026-06-15",
    "batchLotNum": "HCC-2025-0847",
    "testing": {
      "testedForContaminants": true,
      "testingLabName": "CannaTest Labs",
      "testResultsUrl": "https://producer.ca/coa/og-kush-batch-0847.pdf",
      "pesticidesDetected": false,
      "heavyMetalsDetected": false,
      "microbialContaminationDetected": false
    },
    "regulatoryDisclosure": {
      "allergens": [],
      "cannabisAccessRequirement": "RecreationalAndMedical",
      "consumptionWarning": "Keep out of reach of children."
    }
  }
}
```

---

## 4. XML Schema Definition (XSD)

### GoCosta XML Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CannabisProduct>
  <BasicInfo>
    <SKU>HC-OGK-FLOWER-3.5G</SKU>
    <GTIN>00627365491234</GTIN>
    <Name>OG Kush Dried Flower</Name>
    <Brand>Heritage Cannabis Co.</Brand>
    <ProductURL>https://producer.ca/products/og-kush-35g</ProductURL>
    <Description>Premium OG Kush dried flower with a bold citrus and pine profile.</Description>
    <Images>
      <Image>https://producer.ca/images/og-kush-front.jpg</Image>
      <Image>https://producer.ca/images/og-kush-side.jpg</Image>
    </Images>
  </BasicInfo>

  <CannabinoidProfile>
    <THCPercent>18.5</THCPercent>
    <CBDPercent>0.1</CBDPercent>
    <OtherCannabinoids>
      <Cannabinoid>
        <Name>CBN</Name>
        <Percent>0.3</Percent>
      </Cannabinoid>
      <Cannabinoid>
        <Name>CBG</Name>
        <Percent>0.5</Percent>
      </Cannabinoid>
    </OtherCannabinoids>
  </CannabinoidProfile>

  <Strain>
    <StrainName>OG Kush</StrainName>
    <StrainType>Hybrid</StrainType>
    <Lineage>
      <ParentStrain>Hindu Kush</ParentStrain>
      <ParentStrain>Chemdawg</ParentStrain>
    </Lineage>
  </Strain>

  <TerpeneProfile>
    <DominantTerpenes>
      <Terpene>Myrcene</Terpene>
      <Terpene>Limonene</Terpene>
      <Terpene>Caryophyllene</Terpene>
    </DominantTerpenes>
    <DetailedProfile>
      <Terpene>
        <Name>Myrcene</Name>
        <Percent>0.8</Percent>
      </Terpene>
      <Terpene>
        <Name>Limonene</Name>
        <Percent>0.6</Percent>
      </Terpene>
    </DetailedProfile>
  </TerpeneProfile>

  <ProductForm>
    <Form>Dried Flower</Form>
    <PackageSize>3.5g</PackageSize>
    <PackageWeightGrams>3.5</PackageWeightGrams>
  </ProductForm>

  <RegulatoryData>
    <ClassOfCannabis>Dried cannabis</ClassOfCannabis>
    <HealthCanadaLicenseNum>LC0001234567</HealthCanadaLicenseNum>
    <ExpiryDate>2026-06-15</ExpiryDate>
    <BatchLotNum>HCC-2025-0847</BatchLotNum>
    <Allergens/>
    <CannabisAccessRequirement>RecreationalAndMedical</CannabisAccessRequirement>
  </RegulatoryData>

  <Testing>
    <TestedForContaminants>true</TestedForContaminants>
    <TestingLabName>CannaTest Labs</TestingLabName>
    <TestResultsURL>https://producer.ca/coa/og-kush-batch-0847.pdf</TestResultsURL>
    <PesticidesDetected>false</PesticidesDetected>
    <HeavyMetalsDetected>false</HeavyMetalsDetected>
    <MicrobialContaminationDetected>false</MicrobialContaminationDetected>
  </Testing>

  <Pricing>
    <Price>12.99</Price>
    <Currency>CAD</Currency>
    <Availability>InStock</Availability>
  </Pricing>
</CannabisProduct>
```

---

## 5. Implementation Guidelines

### 5.1 JSON-LD Best Practices
- Place the `<script type="application/ld+json">` tag in the `<head>` section of your product page.
- Follow the content rules in section 2.7: no effect claims, ratings, reviews or approval claims.
- Ensure all required fields are populated; leave optional fields blank or omit them if data is unavailable.
- Use ISO 8601 format for dates (YYYY-MM-DD).
- Validate your JSON-LD using [JSON-LD Playground](https://json-ld.org/playground/) or Google's Structured Data Testing Tool.
- Update JSON-LD whenever product information changes (price, availability, batch).

### 5.2 XML Best Practices
- Host the XML file at a consistent URL (e.g., `/feeds/products.xml` or `/api/products/{sku}.xml`).
- Include an XML feed that lists all products, or provide individual product XML documents.
- Use UTF-8 encoding for all XML documents.
- Validate XML against `schemas/gocosta-v1.1.xsd`. It accepts a single `<CannabisProduct>` or a `<CannabisProductFeed>`. XSD cannot check the form-to-class and class-to-potency rules; the JSON Schema does.
- Provide an XML sitemap index that lists all product feed URLs.

### 5.3 Validation & QA
- Use online JSON-LD validators to ensure compliance.
- Validate the `cannabis` object against the JSON Schema in `schemas/gocosta-v1.1.schema.json` (e.g., with `ajv` or any JSON Schema 2020-12 validator).
- Cross-reference cannabinoid and terpene percentages against lab test reports.
- Verify that all URLs (product pages, images, CoA links) are valid and accessible.
- Test both JSON-LD and XML feeds on staging before deploying to production.

---

## 6. Distribution & Discovery

### 6.1 How Dispensaries and Aggregators Consume This Data
1. Scan the producer's website for the GoCosta JSON-LD schema embedded in product pages.
2. Alternatively, request the product feed (XML or JSON) from the producer's API.
3. Import product data into their inventory, ecommerce, or catalog management system.
4. Display standardized product information (cannabinoids, terpenes, pricing) to consumers.

### 6.2 Search Engine Optimization (SEO)
- JSON-LD schema improves SEO and can trigger rich results for cannabis products in search engines that support them.
- Ensures consistent product data across organic search and third-party aggregators.
- Supports voice search and AI-powered product discovery.

---

## 7. Extensibility & Future Updates

The GoCosta schema is versioned. Future versions may include:
- Integration with blockchain-based product traceability.
- Enhanced batch and harvest tracking data.
- Regional regulatory variations (U.S. state-specific requirements).
- Medical-channel data for products sold under Part 14 of the *Cannabis Regulations* (availability only; no therapeutic claims).

Producers can extend the schema with custom fields under a custom namespace (e.g., `myproducer:customAttribute`).

---

## 8. Support & Governance

- **Specification Hosting:** Schema documentation and validation tools at [gocosta.org](https://gocosta.org)
- **Community Forum:** For questions, feedback, and implementation best practices
- **Validation Tools:** Free online JSON-LD and XML validators
- **Contact:** Support available for producers implementing the standard

---

## Appendix: Common Terpenes Reference

| Terpene | Aroma | Typical % Range in dried cannabis |
|---|---|---|
| Myrcene | Earthy, Musky | 0.5–1.2% |
| Limonene | Citrus | 0.3–0.8% |
| Caryophyllene | Spicy, Pepper | 0.2–0.5% |
| Pinene | Pine | 0.2–0.5% |
| Linalool | Floral | 0.1–0.5% |
| Humulene | Hoppy, Herbal | 0.1–0.3% |
| Terpinolene | Fresh, Herbal | 0.1–0.2% |

---

## Changelog

### v1.1 (October 2026)
- **Breaking:** `classOfCannabis` now uses the seven Health Canada classes of cannabis (*Cannabis Act*, Schedule 4). The v1.0 values "Cannabis", "Cannabis (dried)", "Cannabis (fresh)" and "Cannabis oil" are deprecated; "Cannabis oil" has not been a legal class since October 2019. See section 2.6 for the migration table.
- Added section 2.6, mapping `productForm` to `classOfCannabis`.
- Added a machine-readable JSON Schema at `schemas/gocosta-v1.1.schema.json` that validates the full product document, including the form-to-class and class-to-potency rules.
- Corrected the class in the examples and producer templates (vapes and oils are extracts; edibles and beverages are edible cannabis).
- **Breaking:** Potency requirements now follow the label basis for each class (% for dried/fresh, mg per container for edibles, mg/g or mg/mL for extracts and topicals). Added `thcTotalMg`, `cbdTotalMg`, `thcConcentration`, `cbdConcentration`, `thcPerUnitMg`, `cbdPerUnitMg`. `thcPerServing` / `cbdPerServing` are replaced by `thcPerUnitMg` / `cbdPerUnitMg`.
- **Breaking:** Removed `dominantEffect`, terpene `effectCategory` and `healthCanadaApprovedInd`; removed `aggregateRating` from examples. Added section 2.7, Content Rules (Canada).
- **Breaking:** Removed "19Plus" from `cannabisAccessRequirement`; minimum age is a jurisdiction rule, not a product attribute.
- `strainName` is now optional.
- Added an XML Schema at `schemas/gocosta-v1.1.xsd`.

### v1.0 (November 2025)
- Initial release.

---

**GoCosta Schema v1.1** | Published: November 2025 | Updated: October 2026 | License: CC BY 4.0 (Open Attribution)