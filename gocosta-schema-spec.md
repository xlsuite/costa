# GoCosta Cannabis Product Schema v1.0
## Technical Specification & Implementation Guide

---

## 1. Overview

GoCosta is an open, decentralized standard for marking up cannabis product data using JSON-LD and XML. This specification enables licensed cannabis producers and brands to host standardized, machine-readable product information directly on their websites without requiring a central authority.

**Key Principles:**
- **Decentralized:** Data is hosted and managed by each producer on their own domain.
- **Open:** Built on schema.org extensions and widely adopted web standards.
- **Consumer-Centric:** Supports transparency around cannabinoid profiles, terpenes, effects, and regulatory compliance.
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
- **thcPercent** (number, required): THC content as percentage (e.g., 18.5)
- **cbdPercent** (number, required): CBD content as percentage (e.g., 0.1)
- **thcRangeMin** (number, optional): THC minimum if variable
- **thcRangeMax** (number, optional): THC maximum if variable
- **cannabinoidOther** (array of objects, optional): Other cannabinoids (CBN, CBG, THCV, etc.)
  - name: Cannabinoid name
  - percent: Percentage content

#### Strain & Genetics
- **strainName** (string, required): Strain identifier (e.g., "OG Kush")
- **strainType** (enum, optional): "Indica", "Sativa", "Hybrid"
- **strainLineage** (array, optional): Parent strain names
- **dominantEffect** (enum, optional): "Relaxing", "Energizing", "Balanced", "Sleep", "Pain Relief", "Creativity"

#### Terpene Profile
- **terpeneDominant** (array of strings, optional): Top 3–5 dominant terpenes (e.g., ["Myrcene", "Limonene", "Caryophyllene"])
- **terpeneProfile** (array of objects, optional): Detailed terpene breakdown
  - name: Terpene name
  - percent: Percentage
  - effectCategory: "Relaxing", "Uplifting", "Aromatic", etc.

#### Product Form & Packaging
- **productForm** (enum, required): "Dried Flower", "Pre-Roll", "Vape Cartridge", "Edible", "Beverage", "Topical", "Concentrate", "Oil", "Capsule", "Tincture"
- **packageSize** (string, required): Package quantity with unit (e.g., "3.5g", "10 pack", "30ml")
- **packageWeightGrams** (number, optional): Total weight in grams
- **packageCount** (number, optional): Number of units if applicable (e.g., 10 for pre-rolls)

### 2.3 Regulatory & Compliance Data

#### Health Canada / Regulatory
- **classOfCannabis** (enum, required for Canada): "Cannabis", "Cannabis (dried)", "Cannabis (fresh)", "Cannabis oil"
- **healthCanadaLicenseNum** (string, optional): License number of producer
- **healthCanadaApprovedInd** (boolean, optional): Health Canada approved indicator
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
- **consumptionWarning** (string, optional): Standardized warning text
- **allergens** (array of strings, optional): List of allergens (e.g., ["Tree Nuts", "Sulfites"])
- **cannabisAccessRequirement** (enum, optional): "19Plus", "AdultUse", "MedicalOnly", "RecreationalAndMedical"

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
          "percent": 0.8,
          "effectCategory": "Relaxing"
        },
        {
          "name": "Limonene",
          "percent": 0.6,
          "effectCategory": "Uplifting"
        },
        {
          "name": "Caryophyllene",
          "percent": 0.5,
          "effectCategory": "Anti-inflammatory"
        }
      ]
    },
    "dominantEffect": "Relaxing",
    "productForm": "Dried Flower",
    "packageSize": "3.5g",
    "packageWeightGrams": 3.5,
    "classOfCannabis": "Cannabis (dried)",
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
      "consumptionWarning": "Keep out of reach of children. For use by adults 19+."
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.7,
    "reviewCount": 143
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
        <EffectCategory>Relaxing</EffectCategory>
      </Terpene>
      <Terpene>
        <Name>Limonene</Name>
        <Percent>0.6</Percent>
        <EffectCategory>Uplifting</EffectCategory>
      </Terpene>
    </DetailedProfile>
  </TerpeneProfile>

  <ProductForm>
    <Form>Dried Flower</Form>
    <PackageSize>3.5g</PackageSize>
    <PackageWeightGrams>3.5</PackageWeightGrams>
  </ProductForm>

  <RegulatoryData>
    <ClassOfCannabis>Cannabis (dried)</ClassOfCannabis>
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
- Ensure all required fields are populated; leave optional fields blank or omit them if data is unavailable.
- Use ISO 8601 format for dates (YYYY-MM-DD).
- Validate your JSON-LD using [JSON-LD Playground](https://json-ld.org/playground/) or Google's Structured Data Testing Tool.
- Update JSON-LD whenever product information changes (price, availability, batch).

### 5.2 XML Best Practices
- Host the XML file at a consistent URL (e.g., `/feeds/products.xml` or `/api/products/{sku}.xml`).
- Include an XML feed that lists all products, or provide individual product XML documents.
- Use UTF-8 encoding for all XML documents.
- Implement XML validation against the GoCosta schema definition (XSD).
- Provide an XML sitemap index that lists all product feed URLs.

### 5.3 Validation & QA
- Use online JSON-LD validators to ensure compliance.
- Cross-reference cannabinoid and terpene percentages against lab test reports.
- Verify that all URLs (product pages, images, CoA links) are valid and accessible.
- Test both JSON-LD and XML feeds on staging before deploying to production.

---

## 6. Distribution & Discovery

### 6.1 How Dispensaries and Aggregators Consume This Data
1. Scan the producer's website for the GoCosta JSON-LD schema embedded in product pages.
2. Alternatively, request the product feed (XML or JSON) from the producer's API.
3. Import product data into their inventory, ecommerce, or catalog management system.
4. Display standardized product information (cannabinoids, terpenes, effects, pricing) to consumers.

### 6.2 Search Engine Optimization (SEO)
- JSON-LD schema improves SEO and can trigger rich results for cannabis products in search engines that support them.
- Ensures consistent product data across organic search and third-party aggregators.
- Supports voice search and AI-powered product discovery.

---

## 7. Extensibility & Future Updates

The GoCosta schema is versioned. Future versions may include:
- Integration with blockchain-based product traceability.
- Enhanced batch and harvest tracking data.
- Consumer reviews and ratings embedded in the schema.
- Regional regulatory variations (U.S. state-specific requirements).
- Medical cannabis certifications and therapeutic use data.

Producers can extend the schema with custom fields under a custom namespace (e.g., `myproducer:customAttribute`).

---

## 8. Support & Governance

- **Specification Hosting:** Schema documentation and validation tools at [gocosta.org](https://gocosta.org)
- **Community Forum:** For questions, feedback, and implementation best practices
- **Validation Tools:** Free online JSON-LD and XML validators
- **Contact:** Support available for producers implementing the standard

---

## Appendix: Common Terpenes Reference

| Terpene | Primary Effect | Aroma | Typical % Range |
|---------|---|---|---|
| Myrcene | Relaxing | Earthy, Musky | 0.5–1.2% |
| Limonene | Uplifting | Citrus | 0.3–0.8% |
| Caryophyllene | Anti-inflammatory | Spicy, Pepper | 0.2–0.5% |
| Pinene | Alertness | Pine | 0.2–0.5% |
| Linalool | Calming | Floral | 0.1–0.5% |
| Humulene | Anti-inflammatory | Hoppy, Herbal | 0.1–0.3% |
| Terpinolene | Creative | Fresh, Herbal | 0.1–0.2% |

---

**GoCosta Schema v1.0** | Published: November 2025 | License: CC BY 4.0 (Open Attribution)