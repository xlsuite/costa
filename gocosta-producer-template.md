# COSTA 2.0 Producer Guide

How a licensed producer publishes COSTA data. Full rules are in `gocosta-schema-spec.md`. Complete working examples are in `examples/`.

## Before you start

- **Copy the label, not the marketing.** Class, potency, net content and lot data must match the Health Canada-compliant label exactly.
- **Potency is in label units.** Dried flower and pre-rolls are in **mg/g** (21.5% is 215 mg/g). Edibles are in mg per package and per unit. Extracts are in mg/g, or mg per unit for capsules.
- **No claims.** No effects, health benefits, superlatives, ratings or "Health Canada approved". See spec section 8.
- **Your GTINs still come from GS1.** COSTA records them; it does not issue them.

## Steps

1. **Mint a permanent `costaId` for each product**, for example `https://yourdomain.ca/costa/products/{uuid}`. Never reuse it, and never put the GTIN in it.
2. **List every GTIN the product uses**, by packaging level, with `validFrom`. If a GTIN was previously used for something else, check section 5.5 of the spec and record the history.
3. **Pick the class and form** from the table in spec section 4.3, and set `discreteUnits`, `intendedUse` and (for edibles) `edibleForm`.
4. **Enter expected potency ranges** in `potency`, using the statements and units in spec section 4.6.1.
5. **For each lot**, publish a `CostaLot` with the lot number, packaging date and the potency printed on that lot's label, and reference the lab's final-form COA.
6. **Publish the lab report** as a `CostaLabReport` (your lab may publish it for you). Include the SHA-256 of the PDF.
7. **Declare profiles** in `conformsTo`: always `ca-federal/2.0`, plus each province you sell into.
8. **Validate**: `node tools/validate.mjs your-feed.json`. Fix every error; review every warning.
9. **Publish** the feed at `https://yourdomain.ca/.well-known/costa/feed.json` and increase `sequence` each time it changes.
10. **Register** your feed in `registry/publishers.json` by pull request.

## Starting templates

| Product | Start from |
|---|---|
| Dried flower, with lot and COA, Ontario and BC | `examples/dried-flower.feed.json` |
| Edible in discrete units, Ontario and Quebec | `examples/edible-gummy.feed.json` |
| Vape cartridge (extract for inhalation) | `examples/vape-cartridge.product.json` |
| Pre-roll, and a GTIN with reuse history | `examples/gtin-reuse.feed.json` |
| XML versions of all of the above | `examples/xml/` |

## Minimal product skeleton

```json
{
  "@context": "https://gocosta.org/ns/costa-2.0.jsonld",
  "@type": "CostaProduct",
  "costaVersion": "2.0",
  "costaId": "https://yourdomain.ca/costa/products/REPLACE-WITH-UUID",
  "recordVersion": 1,
  "recordUpdated": "2026-11-02T00:00:00Z",
  "status": "active",
  "conformsTo": ["ca-federal/2.0", "ca-on-ocs/2.0"],
  "identifiers": {
    "gtins": [
      { "gtin": "0XXXXXXXXXXXXX", "packagingLevel": "consumerUnit", "validFrom": "2026-11-01", "validThrough": null, "status": "active",
        "barcodes": [{ "symbology": "GS1 DataMatrix", "applicationIdentifiers": ["01", "10", "13"] }] },
      { "gtin": "1XXXXXXXXXXXXX", "packagingLevel": "case", "childGtin": "0XXXXXXXXXXXXX", "childQuantity": 24, "validFrom": "2026-11-01", "validThrough": null, "status": "active",
        "barcodes": [{ "symbology": "GS1-128", "applicationIdentifiers": ["01", "10"] }] }
    ]
  },
  "name": { "en": "PRODUCT NAME 3.5 g", "fr": "NOM DU PRODUIT 3,5 g" },
  "brand": { "name": "BRAND" },
  "licenceHolder": { "legalName": "LEGAL NAME", "role": "processor", "phone": "+1 000 000 0000", "email": "info@yourdomain.ca" },
  "classOfCannabis": "dried cannabis",
  "productForm": "driedFlower",
  "discreteUnits": false,
  "netContent": { "value": 3.5, "unit": "g" },
  "potency": {
    "totalThc": { "unit": "mg/g", "min": 200, "max": 260 },
    "totalCbd": { "unit": "mg/g", "min": 0, "max": 2 }
  },
  "strain": { "name": "STRAIN", "plantType": "hybrid" }
}
```

This skeleton will not pass `ca-on-ocs` until you add a product image, label artwork and a jurisdiction listing; the validator will tell you exactly what is missing.
