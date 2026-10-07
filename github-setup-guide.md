# GoCosta GitHub Repository Setup Guide

## Complete Instructions for Hosting the Cannabis Product Schema on GitHub

---

## Table of Contents

1. [Initial Repository Setup](#initial-repository-setup)
2. [Directory Structure](#directory-structure)
3. [Core Files & Configuration](#core-files--configuration)
4. [GitHub Actions for Validation](#github-actions-for-validation)
5. [Branching Strategy & Contribution Guidelines](#branching-strategy--contribution-guidelines)
6. [Documentation & Publishing](#documentation--publishing)
7. [Automation & Deployment](#automation--deployment)
8. [Community Management](#community-management)

---

## Initial Repository Setup

### Step 1: Create the GitHub Repository

```bash
# Create a new repository on GitHub.com
# Name: gocosta
# Description: "Open, decentralized cannabis product data schema and standards"
# Visibility: Public
# Initialize with README.md: Yes
# Add .gitignore: No (we'll create custom)
# License: Creative Commons Attribution 4.0 (CC-BY-4.0)
```

### Step 2: Clone the Repository Locally

```bash
git clone https://github.com/yourusername/gocosta.git
cd gocosta
```

### Step 3: Configure Git Locally

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

---

## Directory Structure

Create the following directory structure in your repository:

```
gocosta/
├── README.md                          # Main entry point
├── LICENSE                            # CC-BY-4.0 license
├── CONTRIBUTING.md                    # Contribution guidelines
├── CODE_OF_CONDUCT.md                 # Community code of conduct
├── CHANGELOG.md                       # Version history
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md              # Bug report template
│   │   ├── feature_request.md         # Feature request template
│   │   └── schema_extension.md        # Schema extension proposal
│   ├── PULL_REQUEST_TEMPLATE.md       # Pull request template
│   └── workflows/
│       ├── validate-schema.yml        # JSON-LD and XML validation
│       ├── validate-examples.yml      # Validate example files
│       └── deploy-docs.yml            # Deploy docs to GitHub Pages
├── docs/
│   ├── index.md                       # Documentation home
│   ├── getting-started.md             # Quick start guide
│   ├── schema-specification.md        # Full schema docs (or link to spec)
│   ├── implementation-guide.md        # Producer setup guide (or link to template)
│   ├── faq.md                         # Frequently asked questions
│   ├── contributing.md                # How to contribute
│   └── images/                        # Screenshots and diagrams
├── schemas/
│   ├── gocosta-v1.1.schema.json       # JSON Schema definition
│   ├── gocosta-v1.1.xsd               # XML Schema definition
│   └── README.md                      # Schema documentation
├── examples/
│   ├── flower/
│   │   ├── example-og-kush.json       # JSON-LD example
│   │   └── example-og-kush.xml        # XML example
│   ├── preroll/
│   │   └── example-preroll.json
│   ├── vape/
│   │   └── example-vape.json
│   ├── edible/
│   │   └── example-gummy.json
│   ├── oil/
│   │   └── example-oil.json
│   └── README.md                      # Example guide
├── validators/
│   ├── validate-json.js               # Node.js JSON-LD validator
│   ├── validate-xml.js                # Node.js XML validator
│   ├── package.json                   # Node dependencies
│   └── README.md                      # Validator docs
├── tools/
│   ├── convert-json-to-xml.js         # Conversion utility
│   ├── generate-schema-docs.js        # Auto-generate schema docs
│   └── README.md                      # Tools documentation
├── producers/
│   ├── README.md                      # Producer registry
│   ├── producers.json                 # List of adopting producers
│   └── templates/                     # Implementation templates
└── .gitignore                         # Git ignore rules
```

### Step 4: Initialize Directories

```bash
# Create all directories
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p .github/workflows
mkdir -p docs/images
mkdir -p schemas
mkdir -p examples/{flower,preroll,vape,edible,oil}
mkdir -p validators
mkdir -p tools
mkdir -p producers/templates

# Create placeholder README files
touch docs/README.md
touch schemas/README.md
touch examples/README.md
touch validators/README.md
touch tools/README.md
touch producers/README.md
```

---

## Core Files & Configuration

### File 1: `.gitignore`

```gitignore
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
```

### File 2: `LICENSE` (CC-BY-4.0)

Save the Creative Commons Attribution 4.0 license text to `LICENSE` file. Reference: https://creativecommons.org/licenses/by/4.0/legalcode

Or use GitHub's license picker when creating the repo.

### File 3: `README.md`

```markdown
# GoCosta: Open Cannabis Product Data Schema

GoCosta is an open, decentralized standard for marking up cannabis product data using JSON-LD and XML. This specification enables licensed cannabis producers to host standardized, machine-readable product information directly on their websites—without requiring a central authority like GS1.

## Why GoCosta?

- **Decentralized**: Producers host their own product data; no central gatekeeper
- **Open**: Built on schema.org and web standards; extensible by design
- **Cannabis-Focused**: Captures cannabinoid content, strains, terpenes, and regulatory compliance
- **Consumer-Centric**: Supports transparency and trust
- **Interoperable**: Dispensaries, aggregators, and search engines can consume data consistently

## Quick Start

### For Producers
1. [Review the Schema Specification](docs/schema-specification.md)
2. [See Implementation Templates](examples/)
3. [Follow the Implementation Guide](docs/implementation-guide.md)
4. [Test Your Data](validators/)

### For Developers
1. [Explore the JSON Schema](schemas/gocosta-v1.1.schema.json)
2. [Review Example Data](examples/)
3. [Run Validators Locally](validators/)
4. [Contribute to the Schema](CONTRIBUTING.md)

## Repository Structure

```
docs/           → Full documentation
schemas/        → JSON Schema and XSD definitions
examples/       → JSON-LD and XML examples for each product type
validators/     → Validation tools for JSON and XML
tools/          → Utility scripts
producers/      → Producer registry and templates
```

## Key Features

✓ **Comprehensive Cannabinoid Profiles**: THC, CBD, CBN, CBG, and custom cannabinoids  
✓ **Strain & Genetics Data**: Lineage, type (Indica/Sativa/Hybrid)  
✓ **Terpene Profiles**: Dominant and detailed terpene breakdowns  
✓ **Regulatory Compliance**: Health Canada, U.S. state-specific fields  
✓ **Lab Testing Data**: Certificate of Analysis links, contaminant testing  
✓ **Product Forms**: Flower, pre-rolls, vapes, edibles, oils, topicals  
✓ **Dual Format Support**: JSON-LD (web pages) + XML (bulk feeds)  

## Roadmap

### v1.0 (Current)
- Core schema with flower, pre-roll, vape, edible, oil templates
- JSON-LD and XML formats
- Basic validation tools
- Producer implementation templates

### v1.1 (Planned)
- Enhanced batch and harvest tracking
- Regional regulatory variations (US state-specific)
- Medical-channel availability data
- Blockchain traceability integration

### v2.0 (Future)
- Consumer review integration
- AI-powered product discovery attributes
- International cannabis market variations

## Contributing

We welcome contributions from producers, developers, standards bodies, and community members.

- [Contribution Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Issue Templates](.github/ISSUE_TEMPLATE/)

## License

GoCosta schema and documentation are licensed under **Creative Commons Attribution 4.0 (CC-BY-4.0)**. You are free to share, adapt, and use the schema for commercial or non-commercial purposes, with attribution.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/yourusername/gocosta/issues)
- 💬 [Discussions](https://github.com/yourusername/gocosta/discussions)
- 📧 Contact: support@gocosta.org

---

**GoCosta v1.0** | Published: November 2025 | Built for the open cannabis industry
```

### File 4: `CONTRIBUTING.md`

```markdown
# Contributing to GoCosta

Thank you for considering contributing to GoCosta! This document outlines how to help.

## Ways to Contribute

1. **Report Bugs**: Use the [Bug Report Issue Template](.github/ISSUE_TEMPLATE/bug_report.md)
2. **Suggest Features**: Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)
3. **Propose Schema Extensions**: Use the [Schema Extension Template](.github/ISSUE_TEMPLATE/schema_extension.md)
4. **Improve Documentation**: Submit PRs to `docs/`
5. **Add Examples**: Submit producer examples to `examples/`
6. **Contribute Validators**: Add validation tools to `validators/`

## Contribution Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and commit: `git commit -m "Add: [clear description]"`
4. Push to your fork: `git push origin feature/your-feature`
5. Submit a Pull Request with a detailed description

## Pull Request Requirements

- [ ] Changes follow the schema specification
- [ ] Examples are validated and work correctly
- [ ] Documentation is updated if applicable
- [ ] Tests pass (if applicable)
- [ ] Commit messages are clear and descriptive

## Schema Extension Proposals

Proposing changes to the core schema?

1. Open an issue using the [Schema Extension Template](.github/ISSUE_TEMPLATE/schema_extension.md)
2. Describe the use case and rationale
3. Provide examples
4. Wait for discussion and consensus
5. Submit a PR when approved

## Code Style

- **JSON**: Use 2-space indentation, validate with JSON-LD Playground
- **XML**: Use 2-space indentation, validate with XML validators
- **Markdown**: Use CommonMark standard
- **JavaScript**: Use ESLint (if contributing validation tools)

## License

By contributing to GoCosta, you agree that your contributions are licensed under CC-BY-4.0.

## Questions?

Open an issue or start a discussion in the [Discussions tab](https://github.com/yourusername/gocosta/discussions).
```

### File 5: `CODE_OF_CONDUCT.md`

```markdown
# Community Code of Conduct

## Our Commitment

GoCosta is dedicated to providing a welcoming, inclusive, and harassment-free community for all contributors and users.

## Expected Behavior

- Be respectful and professional in all interactions
- Welcome diverse perspectives and constructive criticism
- Focus on what benefits the cannabis industry and consumers
- Be patient and supportive with newcomers

## Unacceptable Behavior

- Harassment, discrimination, or offensive language
- Attacks on individuals or organizations
- Spam or off-topic content
- Any behavior that creates an unsafe or unwelcome environment

## Reporting Issues

If you experience or witness unacceptable behavior, please contact the maintainers at conduct@gocosta.org.

All reports will be handled confidentially.
```

### File 6: `CHANGELOG.md`

```markdown
# Changelog

All notable changes to GoCosta are documented here.

## [1.0.0] - November 22, 2025

### Added
- Initial release of GoCosta schema v1.0
- JSON-LD and XML format support
- Comprehensive cannabis product attributes (cannabinoids, terpenes, strains)
- Health Canada regulatory compliance fields
- U.S. testing and labeling requirements
- 5 product type templates (flower, pre-roll, vape, edible, oil)
- Basic JSON and XML validators
- Producer implementation template
- Example product data files
- Full specification documentation

### Planned for v1.1
- Enhanced batch tracking
- Regional regulatory variations
- Medical-channel availability data
```

---

## GitHub Actions for Validation

### Workflow 1: Validate Schema (`.github/workflows/validate-schema.yml`)

```yaml
name: Validate Schema Files

on:
  push:
    branches: [ main, develop ]
    paths: [ 'schemas/**', 'examples/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'schemas/**', 'examples/**' ]

jobs:
  validate-json-schema:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install -g ajv-cli
      
      - name: Validate JSON examples against schema
        run: |
          ajv validate -s schemas/gocosta-v1.1.schema.json -d 'examples/**/*.json' --verbose
      
      - name: Validate JSON-LD with JSON-LD validator
        run: npm install jsonld && node validators/validate-json.js

  validate-xml:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install XML validators
        run: npm install xsd-schema-validator
      
      - name: Validate XML examples against XSD
        run: node validators/validate-xml.js
```

### Workflow 2: Validate Examples (`.github/workflows/validate-examples.yml`)

```yaml
name: Validate Example Files

on:
  push:
    branches: [ main ]
    paths: [ 'examples/**' ]
  pull_request:
    branches: [ main ]

jobs:
  lint-json:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check JSON formatting
        run: |
          for file in examples/**/*.json; do
            echo "Checking $file"
            jq . "$file" > /dev/null || exit 1
          done
  
  lint-xml:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install xmllint
        run: sudo apt-get install -y libxml2-utils
      
      - name: Check XML formatting
        run: |
          for file in examples/**/*.xml; do
            echo "Checking $file"
            xmllint --format "$file" > /dev/null || exit 1
          done
```

### Workflow 3: Deploy Documentation (`.github/workflows/deploy-docs.yml`)

```yaml
name: Deploy Documentation

on:
  push:
    branches: [ main ]
    paths: [ 'docs/**', 'README.md', 'CHANGELOG.md' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Pages
        uses: actions/configure-pages@v4
      
      - name: Build site with Jekyll
        uses: actions/jekyll-build-pages@v1
        with:
          source: ./docs
          destination: ./_site
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Branching Strategy & Contribution Guidelines

### Branch Naming Convention

```
main          → Production-ready, stable schema releases
develop       → Development branch, staging for next release
feature/*     → New features or schema extensions (e.g., feature/blockchain-traceability)
bugfix/*      → Bug fixes (e.g., bugfix/cannabinoid-validation)
docs/*        → Documentation updates (e.g., docs/update-faq)
```

### Protection Rules for Main Branch

1. Go to **Settings > Branches > Branch Protection Rules**
2. Add protection rule for `main` with:
   - ✓ Require pull request reviews (at least 2)
   - ✓ Require status checks to pass (validate-schema, lint)
   - ✓ Require branches to be up to date before merging
   - ✓ Require signed commits (optional but recommended)
   - ✓ Restrict who can push to matching branches

### Commit Message Format

```
Type: Brief description (50 chars max)

Longer explanation (if needed, wrap at 72 chars)
- Bullet point for changes
- Another change detail

Closes: #123 (if applicable)
```

**Types**: `Add`, `Fix`, `Update`, `Refactor`, `Docs`, `Test`

Example:
```
Add: THC range support for flower products

Previously, flowers with variable THC could only represent
a single THC percentage. Now supports thcRangeMin and thcRangeMax
to capture potency ranges across harvests.

- Updated JSON Schema to allow THC range fields
- Added XML Schema updates
- Updated examples/flower/example-variable-thc.json
- Updated documentation

Closes: #47
```

---

## Documentation & Publishing

### GitHub Pages Setup

1. Go to **Settings > Pages**
2. Select **Source: Deploy from a branch**
3. Select branch: **main** and folder: **/docs**
4. Click **Save**

Your docs will be published to: `https://yourusername.github.io/gocosta/`

### Create `docs/_config.yml` for Jekyll

```yaml
title: GoCosta - Open Cannabis Product Data Schema
description: Decentralized cannabis product schema standards
theme: jekyll-theme-minimal

markdown: kramdown
highlighter: rouge

exclude:
  - Gemfile
  - Gemfile.lock
```

### Create `docs/index.md`

```markdown
---
layout: default
title: GoCosta Documentation
---

# GoCosta: Open Cannabis Product Data Schema

[Link to Quick Start](getting-started.md) | [Schema Spec](schema-specification.md) | [Examples](../examples/) | [GitHub Repo](https://github.com/yourusername/gocosta)

[Content here]
```

---

## Automation & Deployment

### Set Up Repository Secrets

Go to **Settings > Secrets and variables > Actions** and add:

```
GOCOSTA_SUPPORT_EMAIL = support@gocosta.org
DISCORD_WEBHOOK_URL = [your Discord webhook for notifications]
```

### Add GitHub Discussions

1. Go to **Settings > General**
2. Scroll to "Features"
3. Check **Discussions**
4. Create discussion categories:
   - "Announcements" (read-only)
   - "Schema Questions"
   - "Implementation Help"
   - "Show & Tell" (producer showcases)

### Enable Issues & Pull Request Templates Auto-Population

GitHub will automatically show templates when users create issues/PRs if they're in `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE.md`.

### Add Release Automation

1. Create a **Release** in GitHub (Releases tab)
2. Tag as: `v1.0.0`
3. Name: `GoCosta Schema v1.0`
4. Describe changes

---

## Community Management

### Issue Templates

#### `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug Report
about: Report a problem with the schema or examples
labels: bug
---

## Description
[Describe the bug]

## Affected Component
- [ ] JSON Schema
- [ ] XML Schema
- [ ] Examples
- [ ] Validators
- [ ] Documentation

## Steps to Reproduce
1. [First step]
2. [Second step]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., macOS, Linux, Windows]
- Node version: [if applicable]

## Additional Context
[Screenshots, error messages, etc.]
```

#### `.github/ISSUE_TEMPLATE/feature_request.md`

```markdown
---
name: Feature Request
about: Suggest an enhancement to GoCosta
labels: enhancement
---

## Description
[Describe the feature]

## Use Case
[Why do we need this?]

## Proposed Solution
[How should this work?]

## Examples
[Code examples or wireframes]
```

#### `.github/ISSUE_TEMPLATE/schema_extension.md`

```markdown
---
name: Schema Extension Proposal
about: Propose a change to the core schema
labels: schema
---

## Proposal
[Describe the schema extension]

## Rationale
[Why should this be added?]

## Use Cases
[Who benefits and how?]

## Proposed Fields
[New or modified fields]

## Backwards Compatibility
[ ] Backwards compatible
[ ] Breaking change (requires version bump)

## Examples
[JSON-LD and XML examples]
```

#### `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## Description
[What does this PR accomplish?]

## Type of Change
- [ ] Schema update
- [ ] New examples
- [ ] Bug fix
- [ ] Documentation
- [ ] Validator/Tool

## Related Issues
Closes: #[issue number]

## Checklist
- [ ] Schema validated (if applicable)
- [ ] Examples tested
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Commit messages follow format

## Testing
[How was this tested?]

## Screenshots / Evidence
[If applicable]
```

---

## First Deployment Steps

### 1. Initial Commit

```bash
# Add all files
git add .

# Commit
git commit -m "Initial: GoCosta schema v1.0 with documentation and examples"

# Push to main
git push origin main
```

### 2. Create Initial Release

```bash
# Create and tag release
git tag -a v1.0.0 -m "GoCosta Schema v1.0 - Initial Release"
git push origin v1.0.0
```

Then go to **Releases** on GitHub and create a release from the tag with detailed release notes.

### 3. Enable GitHub Pages

Settings > Pages > Source: `main` / `/docs` folder

### 4. Add Topics

Go to **Settings > General** and add repository topics:
- `cannabis`
- `schema`
- `json-ld`
- `xml`
- `standards`
- `open-source`
- `data-standards`

### 5. Add Collaborators

Go to **Settings > Collaborators** and invite:
- Other schema maintainers
- Community reviewers
- Documentation contributors

---

## Marketing Your Repository

### Add Badges to README

```markdown
![GitHub Release](https://img.shields.io/github/v/release/yourusername/gocosta?style=flat-square)
![License](https://img.shields.io/badge/license-CC--BY--4.0-blue?style=flat-square)
![GitHub Issues](https://img.shields.io/github/issues/yourusername/gocosta?style=flat-square)
[![GitHub Discussions](https://img.shields.io/badge/GitHub_Discussions-Ask_a_question-blue?style=flat-square)](https://github.com/yourusername/gocosta/discussions)
```

### Share & Promote

- Link from cannabis industry websites
- Post to Reddit r/cannabis, r/cannabisdata, industry forums
- Share on LinkedIn, Twitter/X with #cannabis #openstandards #schema
- Submit to GitHub's "Awesome" lists (awesome-cannabis, awesome-json-schema)
- Reach out to cannabis tech conferences

---

## Maintenance Best Practices

### Monthly Checklist

- [ ] Review open issues
- [ ] Merge stale discussions into documentation
- [ ] Update CHANGELOG if there are pending changes
- [ ] Check for security vulnerabilities in dependencies
- [ ] Respond to community questions

### Quarterly Tasks

- [ ] Plan next version (v1.1, v2.0)
- [ ] Review feature requests and prioritize
- [ ] Collect feedback from producer community
- [ ] Update roadmap

---

## Quick Reference Commands

```bash
# Clone the repo
git clone https://github.com/yourusername/gocosta.git
cd gocosta

# Create a feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Add: Your feature description"

# Push and create PR
git push origin feature/your-feature

# Sync with upstream (if you forked)
git fetch upstream
git rebase upstream/main
git push origin main

# Delete local branch after PR merge
git branch -d feature/your-feature

# Create a release tag
git tag -a v1.1.0 -m "Version 1.1.0 - New features"
git push origin v1.1.0
```

---

**GoCosta GitHub Setup Guide v1.0** | Published: November 2025