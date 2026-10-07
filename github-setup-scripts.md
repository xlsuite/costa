# GoCosta GitHub Quick Setup Scripts

## Automated Setup Bash Scripts

Use these scripts to quickly scaffold the GoCosta repository locally.

---

## Script 1: `setup-repo.sh` - Initialize Repository Structure

Save this as `scripts/setup-repo.sh` in your repository and run it after cloning:

```bash
#!/bin/bash
# GoCosta Repository Setup Script
# Usage: bash scripts/setup-repo.sh

set -e

echo "🚀 GoCosta Repository Setup"
echo "============================"
echo ""

# Create directory structure
echo "📁 Creating directory structure..."

mkdir -p .github/ISSUE_TEMPLATE
mkdir -p .github/workflows
mkdir -p docs/images
mkdir -p schemas
mkdir -p examples/{flower,preroll,vape,edible,oil}
mkdir -p validators
mkdir -p tools
mkdir -p producers/templates
mkdir -p scripts

# Create placeholder README files
touch docs/README.md
touch schemas/README.md
touch examples/README.md
touch validators/README.md
touch tools/README.md
touch producers/README.md

echo "✅ Directories created"
echo ""

# Initialize git
echo "🔧 Initializing Git repository..."
git config user.name "${GIT_USER_NAME:-Your Name}"
git config user.email "${GIT_USER_EMAIL:-your.email@example.com}"
git branch -M main

echo "✅ Git configured"
echo ""

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# IDE & Editor
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Environment
.env
.env.local

# Build & Output
dist/
build/
*.log

# OS
Thumbs.db
EOF

echo "✅ .gitignore created"
echo ""

# Create LICENSE (CC-BY-4.0)
echo "📋 Creating LICENSE (CC-BY-4.0)..."
cat > LICENSE << 'EOF'
Creative Commons Attribution 4.0 International

For full license text, see: https://creativecommons.org/licenses/by/4.0/legalcode
EOF

echo "✅ LICENSE created"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update README.md with your project details"
echo "2. Add schema files to schemas/"
echo "3. Add examples to examples/"
echo "4. Create GitHub Actions workflows in .github/workflows/"
echo "5. Run: git add . && git commit -m 'Initial: GoCosta setup'"
echo "6. Run: git push origin main"
echo ""
```

---

## Script 2: `create-example.sh` - Generate New Product Examples

Save as `scripts/create-example.sh`:

```bash
#!/bin/bash
# Create a new product example
# Usage: bash scripts/create-example.sh <product-type> <strain-name>

set -e

if [ $# -lt 2 ]; then
    echo "Usage: bash scripts/create-example.sh <product-type> <strain-name>"
    echo "Product types: flower, preroll, vape, edible, oil"
    echo "Example: bash scripts/create-example.sh flower 'og-kush'"
    exit 1
fi

PRODUCT_TYPE=$1
STRAIN_NAME=$2
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

EXAMPLE_DIR="examples/$PRODUCT_TYPE"
mkdir -p "$EXAMPLE_DIR"

JSON_FILE="$EXAMPLE_DIR/example-${STRAIN_NAME}-${TIMESTAMP}.json"
XML_FILE="$EXAMPLE_DIR/example-${STRAIN_NAME}-${TIMESTAMP}.xml"

echo "📝 Creating example files..."
echo "   Product Type: $PRODUCT_TYPE"
echo "   Strain: $STRAIN_NAME"
echo ""

# Create JSON-LD template
cat > "$JSON_FILE" << 'TEMPLATE'
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "@id": "https://yoursite.ca/products/PRODUCT-ID",
  "name": "PRODUCT_NAME",
  "brand": {
    "@type": "Brand",
    "name": "YOUR_BRAND",
    "url": "https://yoursite.ca"
  },
  "sku": "YOUR_SKU",
  "url": "https://yoursite.ca/products/PRODUCT-ID",
  "image": ["https://yoursite.ca/images/product.jpg"],
  "description": "YOUR_DESCRIPTION",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "CAD",
    "price": "12.99",
    "availability": "https://schema.org/InStock"
  },
  "cannabis": {
    "@type": "CannabisProduct",
    "cannabinoidProfile": {
      "thcPercent": 18.5,
      "cbdPercent": 0.1
    },
    "productForm": "PRODUCT_TYPE",
    "classOfCannabis": "CLASS_OF_CANNABIS"
  }
}
TEMPLATE

# Create XML template
cat > "$XML_FILE" << 'TEMPLATE'
<?xml version="1.0" encoding="UTF-8"?>
<CannabisProduct>
  <BasicInfo>
    <SKU>YOUR_SKU</SKU>
    <Name>PRODUCT_NAME</Name>
    <Brand>YOUR_BRAND</Brand>
    <ProductURL>https://yoursite.ca/products/PRODUCT-ID</ProductURL>
    <Description>YOUR_DESCRIPTION</Description>
  </BasicInfo>
  <CannabinoidProfile>
    <THCPercent>18.5</THCPercent>
    <CBDPercent>0.1</CBDPercent>
  </CannabinoidProfile>
  <ProductForm>
    <Form>PRODUCT_TYPE</Form>
  </ProductForm>
  <RegulatoryData>
    <ClassOfCannabis>CLASS_OF_CANNABIS</ClassOfCannabis>
  </RegulatoryData>
</CannabisProduct>
TEMPLATE

echo "✅ JSON-LD example: $JSON_FILE"
echo "✅ XML example: $XML_FILE"
echo ""
echo "📝 Edit these files and replace placeholder values:"
echo "   - PRODUCT_NAME, PRODUCT_TYPE, YOUR_SKU, YOUR_BRAND, YOUR_DESCRIPTION"
echo "   - CLASS_OF_CANNABIS (one of: Dried cannabis, Fresh cannabis, Cannabis plants,"
echo "     Cannabis plant seeds, Edible cannabis, Cannabis extracts, Cannabis topicals)"
echo ""
```

---

## Script 3: `validate-examples.sh` - Validate All Examples

Save as `scripts/validate-examples.sh`:

```bash
#!/bin/bash
# Validate all JSON and XML examples
# Requires: jq (JSON), xmllint (XML)
# Usage: bash scripts/validate-examples.sh

set -e

echo "🔍 Validating GoCosta Examples"
echo "==============================="
echo ""

# Check for required tools
if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Install with: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

if ! command -v xmllint &> /dev/null; then
    echo "❌ xmllint is not installed. Install with: brew install libxml2 (macOS) or apt-get install libxml2-utils (Linux)"
    exit 1
fi

JSON_VALID=0
JSON_INVALID=0
XML_VALID=0
XML_INVALID=0

# Validate JSON files
echo "📋 Validating JSON-LD examples..."
for json_file in examples/**/*.json; do
    if [ -f "$json_file" ]; then
        if jq . "$json_file" > /dev/null 2>&1; then
            echo "  ✅ $json_file"
            ((JSON_VALID++))
        else
            echo "  ❌ $json_file (invalid JSON)"
            ((JSON_INVALID++))
        fi
    fi
done

echo ""
echo "📋 Validating XML examples..."
for xml_file in examples/**/*.xml; do
    if [ -f "$xml_file" ]; then
        if xmllint --format "$xml_file" > /dev/null 2>&1; then
            echo "  ✅ $xml_file"
            ((XML_VALID++))
        else
            echo "  ❌ $xml_file (invalid XML)"
            ((XML_INVALID++))
        fi
    fi
done

echo ""
echo "📊 Validation Summary"
echo "====================="
echo "JSON-LD: $JSON_VALID valid, $JSON_INVALID invalid"
echo "XML:     $XML_VALID valid, $XML_INVALID invalid"

if [ $JSON_INVALID -gt 0 ] || [ $XML_INVALID -gt 0 ]; then
    echo ""
    echo "❌ Some files failed validation"
    exit 1
else
    echo ""
    echo "✅ All examples are valid!"
    exit 0
fi
```

---

## Script 4: `generate-feeds.sh` - Generate Product Feeds

Save as `scripts/generate-feeds.sh`:

```bash
#!/bin/bash
# Generate combined XML feed from all examples
# Usage: bash scripts/generate-feeds.sh

set -e

echo "📦 Generating product feeds..."
echo ""

# Create feeds directory
mkdir -p feeds

# Generate combined XML feed
echo "📝 Creating combined product feed..."

cat > feeds/all-products.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CannabisProductFeed>
  <FeedInfo>
    <ProducerName>GoCosta Example Products</ProducerName>
    <FeedURL>https://github.com/yourusername/gocosta/feeds/all-products.xml</FeedURL>
    <LastUpdated>$(date -u +%Y-%m-%dT%H:%M:%SZ)</LastUpdated>
    <ProductCount>PRODUCT_COUNT</ProductCount>
  </FeedInfo>
EOF

# Append all XML examples
PRODUCT_COUNT=0
for xml_file in examples/**/*.xml; do
    if [ -f "$xml_file" ]; then
        # Extract Product element and append
        xmllint --xpath '//CannabisProduct' "$xml_file" 2>/dev/null >> feeds/all-products.xml || true
        ((PRODUCT_COUNT++))
    fi
done

# Close the feed
echo "" >> feeds/all-products.xml
echo "</CannabisProductFeed>" >> feeds/all-products.xml

echo "✅ Generated feeds/all-products.xml ($PRODUCT_COUNT products)"
echo ""

# Generate JSON feed (optional)
echo "📝 Creating JSON feed..."

cat > feeds/all-products.json << 'EOF'
{
  "@context": "https://schema.org/",
  "@type": "ItemList",
  "name": "GoCosta Cannabis Products",
  "itemListElement": [
EOF

ITEM_COUNT=0
for json_file in examples/**/*.json; do
    if [ -f "$json_file" ]; then
        if [ $ITEM_COUNT -gt 0 ]; then
            echo "," >> feeds/all-products.json
        fi
        cat "$json_file" >> feeds/all-products.json
        ((ITEM_COUNT++))
    fi
done

cat >> feeds/all-products.json << 'EOF'
  ]
}
EOF

echo "✅ Generated feeds/all-products.json ($ITEM_COUNT products)"
echo ""
echo "🎉 Feeds generated successfully!"
echo ""
echo "Feeds available at:"
echo "  - feeds/all-products.xml"
echo "  - feeds/all-products.json"
```

---

## Script 5: `setup-git-hooks.sh` - Install Git Hooks for Validation

Save as `scripts/setup-git-hooks.sh`:

```bash
#!/bin/bash
# Setup Git hooks for automated validation on commit
# Usage: bash scripts/setup-git-hooks.sh

set -e

echo "🔗 Setting up Git hooks..."
echo ""

mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook: validate changed examples

echo "🔍 Running pre-commit validation..."

# Check for JSON errors
for json_file in $(git diff --cached --name-only --diff-filter=A | grep '.json$'); do
    if ! jq . "$json_file" > /dev/null 2>&1; then
        echo "❌ Invalid JSON in $json_file"
        exit 1
    fi
done

# Check for XML errors
for xml_file in $(git diff --cached --name-only --diff-filter=A | grep '.xml$'); do
    if ! xmllint --format "$xml_file" > /dev/null 2>&1; then
        echo "❌ Invalid XML in $xml_file"
        exit 1
    fi
done

echo "✅ Pre-commit validation passed"
exit 0
EOF

chmod +x .git/hooks/pre-commit

# Create commit-msg hook
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash
# Commit message validation hook

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Check commit message format: Type: Description
if ! echo "$COMMIT_MSG" | grep -qE '^(Add|Fix|Update|Refactor|Docs|Test|Revert): '; then
    echo ""
    echo "❌ Commit message format is incorrect."
    echo ""
    echo "Format should be: Type: Description"
    echo ""
    echo "Valid types: Add, Fix, Update, Refactor, Docs, Test, Revert"
    echo "Example: Add: Support for THC range fields in flower products"
    echo ""
    exit 1
fi

exit 0
EOF

chmod +x .git/hooks/commit-msg

echo "✅ Git hooks installed"
echo ""
echo "Hooks configured:"
echo "  - pre-commit: Validates JSON/XML on commit"
echo "  - commit-msg: Validates commit message format"
echo ""
```

---

## Quick Start Commands

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/yourusername/gocosta.git
cd gocosta

# Run setup
bash scripts/setup-repo.sh

# Install git hooks
bash scripts/setup-git-hooks.sh
```

### 2. Create a New Example

```bash
bash scripts/create-example.sh flower "og-kush"
bash scripts/create-example.sh vape "wedding-cake"
bash scripts/create-example.sh edible "strawberry-gummies"
```

### 3. Validate Examples

```bash
bash scripts/validate-examples.sh
```

### 4. Generate Feeds

```bash
bash scripts/generate-feeds.sh
```

### 5. Commit and Push

```bash
git add .
git commit -m "Add: OG Kush and Wedding Cake product examples"
git push origin main
```

---

## Development Environment Setup (Node.js)

### package.json Template

Save as `package.json` in repository root:

```json
{
  "name": "gocosta",
  "version": "1.0.0",
  "description": "Open, decentralized cannabis product data schema",
  "main": "validators/validate-json.js",
  "scripts": {
    "validate:json": "node validators/validate-json.js",
    "validate:xml": "node validators/validate-xml.js",
    "validate:all": "npm run validate:json && npm run validate:xml",
    "test": "npm run validate:all",
    "generate:feeds": "node tools/generate-schema-docs.js"
  },
  "keywords": ["cannabis", "schema", "json-ld", "xml", "standards"],
  "license": "CC-BY-4.0",
  "devDependencies": {
    "ajv": "^8.12.0",
    "jsonld": "^8.1.0",
    "xsd-schema-validator": "^0.2.0"
  }
}
```

### Install Dependencies

```bash
npm install
```

---

## Troubleshooting

### Git hooks not running
```bash
# Make scripts executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg

# Test hook
./.git/hooks/pre-commit
```

### jq/xmllint not found
```bash
# macOS
brew install jq libxml2

# Ubuntu/Debian
sudo apt-get install jq libxml2-utils

# CentOS/RHEL
sudo yum install jq libxml2
```

### Permission denied on scripts
```bash
chmod +x scripts/*.sh
```

---

**GoCosta Quick Setup Scripts v1.0** | Published: November 2025