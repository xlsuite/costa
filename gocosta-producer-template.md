# GoCosta Producer Implementation Template v1.1
## Ready-to-Use JSON-LD & XML Examples for Cannabis Brands

---

## Before You Start: Content Rules (Canada)

- **No effect or health claims** ("relaxing", "sleep", "pain relief", etc.), no ratings, reviews or testimonials, and no "Health Canada approved" claims. See section 2.7 of the spec.
- **Potency follows the label:** % for dried cannabis and pre-rolls, mg per package for edibles, mg/g or mg/mL for extracts and topicals.
- **Class follows the label.** If in doubt, copy the class printed on the package.

---

## Quick Start Guide

This template provides producers with copy-and-paste JSON-LD and XML examples for their cannabis products. Follow these steps:

1. **Copy the relevant JSON-LD or XML block** from this template.
2. **Replace placeholder values** with your actual product data.
3. **Paste JSON-LD into your product page's `<head>` section** (or use your CMS plugin).
4. **Host XML feeds** on your server at a consistent URL.
5. **Validate** using the tools listed at the end.
6. **Test** before deploying to production.

---

## Template 1: Dried Flower Product (JSON-LD)

**Use this for:** Premium dried flower, budget flower, smalls, premium shake

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "@id": "https://yoursite.ca/products/strain-name-size",
  "name": "YOUR_STRAIN_NAME Dried Flower - YOUR_PACKAGE_SIZE",
  "brand": {
    "@type": "Brand",
    "name": "YOUR_BRAND_NAME",
    "url": "https://yoursite.ca"
  },
  "sku": "YOUR_SKU_CODE",
  "gtin": "YOUR_GTIN_OR_BARCODE",
  "url": "https://yoursite.ca/products/strain-name-size",
  "image": [
    "https://yoursite.ca/images/product-front.jpg",
    "https://yoursite.ca/images/product-angle.jpg",
    "https://yoursite.ca/images/product-back.jpg"
  ],
  "description": "YOUR_PRODUCT_DESCRIPTION. Hand-trimmed, cured for quality.",
  "offers": {
    "@type": "Offer",
    "url": "https://yoursite.ca/products/strain-name-size",
    "priceCurrency": "CAD",
    "price": "PRICE_HERE",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "YOUR_BRAND_NAME"
    }
  },
  "cannabis": {
    "@type": "CannabisProduct",
    "cannabinoidProfile": {
      "thcPercent": THC_PERCENTAGE,
      "cbdPercent": CBD_PERCENTAGE,
      "cannabinoidOther": [
        {
          "name": "CBN",
          "percent": CBN_PERCENTAGE
        },
        {
          "name": "CBG",
          "percent": CBG_PERCENTAGE
        }
      ]
    },
    "strain": {
      "name": "YOUR_STRAIN_NAME",
      "type": "Indica|Sativa|Hybrid",
      "lineage": ["PARENT_STRAIN_1", "PARENT_STRAIN_2"]
    },
    "terpeneProfile": {
      "dominant": ["TERPENE_1", "TERPENE_2", "TERPENE_3"],
      "detailed": [
        {
          "name": "Myrcene",
          "percent": 0.8
        },
        {
          "name": "Limonene",
          "percent": 0.6
        }
      ]
    },
    "productForm": "Dried Flower",
    "packageSize": "YOUR_PACKAGE_SIZE",
    "packageWeightGrams": WEIGHT_IN_GRAMS,
    "classOfCannabis": "Dried cannabis",
    "healthCanadaLicenseNum": "YOUR_LICENSE_NUMBER",
    "expiryDate": "YYYY-MM-DD",
    "batchLotNum": "YOUR_BATCH_NUMBER",
    "testing": {
      "testedForContaminants": true,
      "testingLabName": "YOUR_LAB_NAME",
      "testResultsUrl": "https://yoursite.ca/coa/batch-number.pdf",
      "pesticidesDetected": false,
      "heavyMetalsDetected": false,
      "microbialContaminationDetected": false
    },
    "regulatoryDisclosure": {
      "allergens": ["ALLERGEN_IF_APPLICABLE"],
      "cannabisAccessRequirement": "RecreationalAndMedical",
      "consumptionWarning": "Keep out of reach of children."
    }
  }
}
```

---

## Template 2: Pre-Roll Product (JSON-LD)

**Use this for:** Pre-rolled joints, blunts, hemp wraps

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "@id": "https://yoursite.ca/products/preroll-name",
  "name": "YOUR_STRAIN Pre-Roll Pack - YOUR_PACK_SIZE",
  "brand": {
    "@type": "Brand",
    "name": "YOUR_BRAND_NAME",
    "url": "https://yoursite.ca"
  },
  "sku": "YOUR_SKU_CODE",
  "url": "https://yoursite.ca/products/preroll-name",
  "image": [
    "https://yoursite.ca/images/preroll-pack.jpg"
  ],
  "description": "Ready-to-smoke pre-rolled joints made with premium flower and natural rolling paper.",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "CAD",
    "price": "PRICE_HERE",
    "availability": "https://schema.org/InStock"
  },
  "cannabis": {
    "@type": "CannabisProduct",
    "cannabinoidProfile": {
      "thcPercent": THC_PERCENTAGE,
      "cbdPercent": CBD_PERCENTAGE
    },
    "strain": {
      "name": "YOUR_STRAIN_NAME",
      "type": "Indica|Sativa|Hybrid"
    },
    "productForm": "Pre-Roll",
    "packageCount": NUMBER_OF_PREROLLS,
    "packageSize": "YOUR_TOTAL_WEIGHT",
    "classOfCannabis": "Dried cannabis",
    "healthCanadaLicenseNum": "YOUR_LICENSE_NUMBER",
    "batchLotNum": "YOUR_BATCH_NUMBER"
  }
}
```

---

## Template 3: Vape Cartridge Product (JSON-LD)

**Use this for:** Vape pens, cartridges, distillate vapes

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "@id": "https://yoursite.ca/products/vape-strain",
  "name": "YOUR_STRAIN Vape Cartridge - 0.5ml",
  "brand": {
    "@type": "Brand",
    "name": "YOUR_BRAND_NAME",
    "url": "https://yoursite.ca"
  },
  "sku": "YOUR_SKU_CODE",
  "url": "https://yoursite.ca/products/vape-strain",
  "image": [
    "https://yoursite.ca/images/vape-cartridge.jpg"
  ],
  "description": "Full-spectrum vape cartridge with premium distillate and natural terpenes.",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "CAD",
    "price": "PRICE_HERE",
    "availability": "https://schema.org/InStock"
  },
  "cannabis": {
    "@type": "CannabisProduct",
    "cannabinoidProfile": {
      "thcConcentration": { "value": THC_MG_PER_G, "unit": "mg/g" },
      "cbdConcentration": { "value": CBD_MG_PER_G, "unit": "mg/g" }
    },
    "strain": {
      "name": "YOUR_STRAIN_NAME"
    },
    "terpeneProfile": {
      "dominant": ["TERPENE_1", "TERPENE_2", "TERPENE_3"]
    },
    "productForm": "Vape Cartridge",
    "packageSize": "0.5ml",
    "classOfCannabis": "Cannabis extracts",
    "healthCanadaLicenseNum": "YOUR_LICENSE_NUMBER"
  }
}
```

---

## Template 4: Edible Product (JSON-LD)

**Use this for:** Gummies, chocolates, baked goods, beverages (capsules and ingestible oils are cannabis extracts: use Template 5)

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "@id": "https://yoursite.ca/products/edible-name",
  "name": "YOUR_FLAVOR Cannabis Gummies - 2 Pack (5 mg THC each, 10 mg THC total)",
  "brand": {
    "@type": "Brand",
    "name": "YOUR_BRAND_NAME",
    "url": "https://yoursite.ca"
  },
  "sku": "YOUR_SKU_CODE",
  "url": "https://yoursite.ca/products/edible-name",
  "image": [
    "https://yoursite.ca/images/gummies-package.jpg"
  ],
  "description": "YOUR_PRODUCT_DESCRIPTION",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "CAD",
    "price": "PRICE_HERE",
    "availability": "https://schema.org/InStock"
  },
  "cannabis": {
    "@type": "CannabisProduct",
    "cannabinoidProfile": {
      "thcTotalMg": 10,
      "cbdTotalMg": 0,
      "thcPerUnitMg": 5,
      "cbdPerUnitMg": 0
    },
    "productForm": "Edible",
    "packageSize": "2 pack",
    "packageCount": 2,
    "servingSize": "1 gummy",
    "classOfCannabis": "Edible cannabis",
    "healthCanadaLicenseNum": "YOUR_LICENSE_NUMBER",
    "regulatoryDisclosure": {
      "allergens": ["ALLERGEN_1", "ALLERGEN_2"],
      "consumptionWarning": "Keep out of reach of children. Effects may take 1-2 hours. Do not drive or operate machinery."
    }
  }
}
```

---

## Template 5: Cannabis Oil / Tincture (JSON-LD)

**Use this for:** Oils, tinctures, sublingual drops, capsules

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "@id": "https://yoursite.ca/products/oil-name",
  "name": "Full-Spectrum Cannabis Oil - 30ml (750mg THC)",
  "brand": {
    "@type": "Brand",
    "name": "YOUR_BRAND_NAME",
    "url": "https://yoursite.ca"
  },
  "sku": "YOUR_SKU_CODE",
  "url": "https://yoursite.ca/products/oil-name",
  "image": [
    "https://yoursite.ca/images/oil-bottle.jpg"
  ],
  "description": "Premium cannabis oil with full cannabinoid and terpene profile.",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "CAD",
    "price": "PRICE_HERE",
    "availability": "https://schema.org/InStock"
  },
  "cannabis": {
    "@type": "CannabisProduct",
    "cannabinoidProfile": {
      "thcConcentration": { "value": 25, "unit": "mg/mL" },
      "cbdConcentration": { "value": 0, "unit": "mg/mL" },
      "thcPerUnitMg": 12.5,
      "cbdPerUnitMg": 0,
      "cannabinoidOther": [
        {"name": "CBN", "percent": 0.2},
        {"name": "CBG", "percent": 0.3}
      ]
    },
    "terpeneProfile": {
      "dominant": ["TERPENE_1", "TERPENE_2", "TERPENE_3"]
    },
    "productForm": "Oil",
    "packageSize": "30ml",
    "servingSize": "0.5 mL (1 dropper)",
    "classOfCannabis": "Cannabis extracts",
    "healthCanadaLicenseNum": "YOUR_LICENSE_NUMBER"
  }
}
```

---

## Template 6: Multi-Product XML Feed (for bulk upload)

**Use this for:** Syncing multiple products to dispensaries and aggregators

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CannabisProductFeed>
  <FeedInfo>
    <ProducerName>YOUR_BRAND_NAME</ProducerName>
    <HealthCanadaLicenseNum>YOUR_LICENSE_NUMBER</HealthCanadaLicenseNum>
    <FeedURL>https://yoursite.ca/feeds/products.xml</FeedURL>
    <LastUpdated>2025-11-22T15:30:00Z</LastUpdated>
  </FeedInfo>

  <Product>
    <BasicInfo>
      <SKU>HC-OGK-FLOWER-3.5G</SKU>
      <GTIN>00627365491234</GTIN>
      <Name>OG Kush Dried Flower - 3.5g</Name>
      <Brand>YOUR_BRAND_NAME</Brand>
      <ProductURL>https://yoursite.ca/products/og-kush</ProductURL>
      <Description>Premium OG Kush flower hand-trimmed and cured.</Description>
      <Images>
        <Image>https://yoursite.ca/images/og-kush-front.jpg</Image>
        <Image>https://yoursite.ca/images/og-kush-side.jpg</Image>
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
    </TerpeneProfile>

    <ProductForm>
      <Form>Dried Flower</Form>
      <PackageSize>3.5g</PackageSize>
      <PackageWeightGrams>3.5</PackageWeightGrams>
    </ProductForm>

    <RegulatoryData>
      <ClassOfCannabis>Dried cannabis</ClassOfCannabis>
      <HealthCanadaLicenseNum>YOUR_LICENSE_NUMBER</HealthCanadaLicenseNum>
      <ExpiryDate>2026-06-15</ExpiryDate>
      <BatchLotNum>HCC-2025-0847</BatchLotNum>
      <CannabisAccessRequirement>RecreationalAndMedical</CannabisAccessRequirement>
    </RegulatoryData>

    <Testing>
      <TestedForContaminants>true</TestedForContaminants>
      <TestingLabName>CannaTest Labs</TestingLabName>
      <TestResultsURL>https://yoursite.ca/coa/og-kush-0847.pdf</TestResultsURL>
      <PesticidesDetected>false</PesticidesDetected>
      <HeavyMetalsDetected>false</HeavyMetalsDetected>
    </Testing>

    <Pricing>
      <Price>12.99</Price>
      <Currency>CAD</Currency>
      <Availability>InStock</Availability>
    </Pricing>
  </Product>

  <!-- Repeat <Product> blocks for each SKU -->

</CannabisProductFeed>
```

---

## Implementation Checklist

### Step 1: Data Preparation
- [ ] Gather all product information (SKU, GTIN, THC and CBD exactly as on the label, terpenes)
- [ ] Obtain accurate lab testing data (CoA/test reports)
- [ ] Take high-quality product photos
- [ ] Write product descriptions
- [ ] Collect regulatory compliance info (Health Canada license, class of cannabis as printed on your label, expiry dates, batch numbers)

### Step 2: JSON-LD Implementation (Per Product Page)
- [ ] Choose the appropriate template above
- [ ] Replace all placeholder values with your actual data
- [ ] Validate JSON using [JSON-LD Playground](https://json-ld.org/playground/)
- [ ] Validate the `cannabis` object against `schemas/gocosta-v1.1.schema.json`
- [ ] Add the `<script type="application/ld+json">` tag to your product page `<head>`
- [ ] Test on staging environment

### Step 3: XML Feed Implementation (Bulk Products)
- [ ] Create an XML file with all your products using the XML template above
- [ ] Save as `/feeds/products.xml` or similar on your server
- [ ] Validate XML against `schemas/gocosta-v1.1.xsd` (e.g., `xmllint --schema schemas/gocosta-v1.1.xsd products.xml --noout`)
- [ ] Set up automatic daily updates (if products change frequently)
- [ ] Create an XML sitemap that links to your product feeds

### Step 4: Deployment & Testing
- [ ] Deploy JSON-LD to production product pages
- [ ] Host XML feed on your server
- [ ] Test with a sample dispensary or aggregator partner
- [ ] Monitor for validation errors
- [ ] Set up an update schedule for product changes

### Step 5: Promotion
- [ ] Add a link to your GoCosta feed on your website (e.g., `/gocosta-products.xml`)
- [ ] Share feed URL with dispensaries and aggregators
- [ ] Join the GoCosta producer network at [gocosta.org](https://gocosta.org)
- [ ] Update as products, batches, and pricing change

---

## Validation & Testing Tools

| Tool | Purpose | Link |
|------|---------|------|
| JSON-LD Playground | Validate and debug JSON-LD markup | https://json-ld.org/playground/ |
| Google Structured Data Testing | Test how Google sees your schema | https://search.google.com/test/rich-results |
| XML Validator | Validate XML feed structure | https://www.w3schools.com/xml/xml_validator.asp |
| Schema.org Validator | Check schema.org compliance | https://schema.org/validator/ |

---

## Troubleshooting

### Issue: "THC Percent is showing as text, not a number"
**Solution:** Remove quotes around numeric values. Use `"thcPercent": 18.5` not `"thcPercent": "18.5"`

### Issue: "Images are broken links"
**Solution:** Verify all image URLs are fully qualified (start with `https://`) and accessible from the public internet.

### Issue: "My feed isn't being picked up by aggregators"
**Solution:** Ensure your XML feed is valid, make it discoverable (link from your site), and communicate the feed URL to partners.

### Issue: "Product data is stale / out of date"
**Solution:** Set up an automated process to update JSON-LD and XML feeds whenever inventory, batch, or pricing changes.

---

## Support & Resources

- **Full Specification:** See `gocosta-schema-spec.md`
- **Community:** Join the GoCosta producer network
- **Questions?** Contact support at [gocosta.org](https://gocosta.org)

---

**GoCosta Producer Template v1.1** | Published: November 2025 | Updated: October 2026 | License: CC BY 4.0