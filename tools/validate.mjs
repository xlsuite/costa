#!/usr/bin/env node
// COSTA 2.0 reference validator.
// Usage: node tools/validate.mjs [--as-of YYYY-MM-DD] [--json] file1.json [file2.json ...]
// Validates every document against schemas/costa-2.0.schema.json, then applies the
// cross-field rules of the profiles each product declares in `conformsTo`.
// Exit code 0 = no errors (warnings allowed), 1 = errors, 2 = usage problem.

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(join(ROOT, 'schemas/costa-2.0.schema.json'), 'utf8'));
const PROFILES = Object.fromEntries(
  readdirSync(join(ROOT, 'profiles'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(ROOT, 'profiles', f), 'utf8')))
    .map((p) => [`${p.id}/${p.version}`, p])
);

// ---------------------------------------------------------------- helpers

export function gtinCheckDigitOk(gtin) {
  if (!/^[0-9]{14}$/.test(gtin)) return false;
  const d = gtin.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 13; i++) sum += d[i] * (i % 2 === 0 ? 3 : 1);
  return (10 - (sum % 10)) % 10 === d[13];
}

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const day = (s) => (s ? new Date(`${s}T00:00:00Z`).getTime() : NaN);
const DAY_MS = 86400000;

// Section 4.3 of the spec: allowed productForm values per class.
export const FORMS_BY_CLASS = {
  'dried cannabis': ['driedFlower', 'milledFlower', 'preRoll', 'infusedPreRoll'],
  'fresh cannabis': ['freshCannabis'],
  'cannabis plants': ['plant'],
  'cannabis plant seeds': ['seed'],
  'edible cannabis': ['gummy', 'chocolate', 'bakedGood', 'candy', 'beverage', 'beverageEnhancer', 'otherEdible'],
  'cannabis extracts': ['vapeCartridge', 'vapeDisposable', 'vapePod', 'concentrate', 'hash', 'kief', 'rosin', 'resin', 'oil', 'spray', 'capsule', 'infusedPreRoll', 'otherExtract'],
  'cannabis topicals': ['lotion', 'balm', 'bathProduct', 'otherTopical'],
};

const INGESTED_LIKE = ['ingestion', 'nasal', 'rectal', 'vaginal'];

// Which label statements the Cannabis Regulations require, in which unit.
// Returns { required: {field: [units]}, forbidden: [fields] }.
export function labelBasis(p) {
  const c = p.classOfCannabis;
  const discrete = !!p.discreteUnits;
  const inhal = p.intendedUse === 'inhalation';
  const req = {};
  const per = ['totalThcPerUnit', 'totalCbdPerUnit'];
  const act = ['totalThcPerActivation', 'totalCbdPerActivation'];
  let forbidden = [];
  if (c === 'cannabis plants' || c === 'cannabis plant seeds') {
    return { required: {}, forbidden: ['totalThc', 'totalCbd', ...per, ...act], cite: 's. 128-129' };
  }
  if (c === 'dried cannabis' || c === 'fresh cannabis') {
    if (discrete && !inhal) { // s. 124
      req.totalThcPerUnit = ['mg']; req.totalCbdPerUnit = ['mg'];
      forbidden = ['totalThc', 'totalCbd', ...act];
      return { required: req, forbidden, cite: 's. 124' };
    }
    req.totalThc = ['mg/g']; req.totalCbd = ['mg/g']; // s. 124.1, 125
    return { required: req, forbidden: [...per, ...act], cite: discrete ? 's. 124.1' : 's. 125' };
  }
  if (c === 'cannabis extracts') {
    if (discrete && !inhal) { // s. 132.1
      req.totalThcPerUnit = ['mg']; req.totalCbdPerUnit = ['mg'];
      return { required: req, forbidden: ['totalThc', 'totalCbd', ...act], cite: 's. 132.1' };
    }
    if (discrete && inhal) { // s. 132.11
      req.totalThc = ['mg/g']; req.totalCbd = ['mg/g'];
      return { required: req, forbidden: [...per, ...act], cite: 's. 132.11' };
    }
    req.totalThc = ['mg/g']; req.totalCbd = ['mg/g']; // s. 132.12
    if (p.dispensingMechanism && !inhal) { req.totalThcPerActivation = ['mg']; req.totalCbdPerActivation = ['mg']; }
    return { required: req, forbidden: [...per], cite: 's. 132.12' };
  }
  if (c === 'cannabis topicals') {
    if (discrete) { req.totalThcPerUnit = ['mg', 'mg/g']; req.totalCbdPerUnit = ['mg', 'mg/g']; return { required: req, forbidden: ['totalThc', 'totalCbd', ...act], cite: 's. 132.15' }; }
    req.totalThc = ['mg', 'mg/g']; req.totalCbd = ['mg', 'mg/g'];
    return { required: req, forbidden: [...per, ...act], cite: 's. 132.16' };
  }
  if (c === 'edible cannabis') {
    req.totalThc = ['mg']; req.totalCbd = ['mg'];
    if (discrete) { req.totalThcPerUnit = ['mg']; req.totalCbdPerUnit = ['mg']; return { required: req, forbidden: act, cite: 's. 132.18' }; }
    return { required: req, forbidden: [...per, ...act], cite: 's. 132.19' };
  }
  return { required: {}, forbidden: [] };
}

// Total THC per container in mg, from label values, if it can be worked out.
function containerThcMg(p, v) {
  const net = p.netContent;
  if (v.totalThc?.unit === 'mg') return v.totalThc.value;
  if (v.totalThc?.unit === 'mg/g' && net?.unit === 'g') return v.totalThc.value * net.value;
  if (v.totalThc?.unit === 'mg/mL' && net?.unit === 'mL') return v.totalThc.value * net.value;
  if (v.totalThcPerUnit?.unit === 'mg' && p.unitCount) return v.totalThcPerUnit.value * p.unitCount;
  if (v.totalThcPerUnit?.unit === 'mg/g' && p.unitNetContent?.unit === 'g' && p.unitCount)
    return v.totalThcPerUnit.value * p.unitNetContent.value * p.unitCount;
  return undefined;
}

// Schedule 3 of the Cannabis Act.
export function expectedDriedEquivalent(p) {
  const n = p.netContent;
  if (!n) return undefined;
  switch (p.classOfCannabis) {
    case 'dried cannabis': return n.unit === 'g' ? n.value : undefined;
    case 'fresh cannabis': return n.unit === 'g' ? n.value / 5 : undefined;
    case 'cannabis plant seeds': return n.unit === 'count' ? n.value : undefined;
    case 'edible cannabis':
      if (p.edibleForm === 'solid' && n.unit === 'g') return n.value / 15;
      if (p.edibleForm === 'beverage' && n.unit === 'mL') return undefined; // 570 g per 1 g dried: needs mass, not volume
      if (p.edibleForm === 'nonSolid' && n.unit === 'mL') return undefined; // 70 g per 1 g dried: needs mass
      return undefined;
    default: return undefined;
  }
}

// s. 97 permitted variability. Returns [lo, hi] as fractions, or null if no regulatory tolerance.
export function tolerance(p, labelled) {
  const c = p.classOfCannabis;
  if (c === 'cannabis extracts' || c === 'cannabis topicals') return [0.85, 1.15];
  if (c === 'edible cannabis') {
    if (labelled > 5) return [0.85, 1.15];
    if (labelled > 2) return [0.80, 1.20];
    return [0.75, 1.25];
  }
  return null;
}

const CLAIM_PATTERNS = [
  [/\b(relax\w*|calm\w*|sleep\w*|insomnia|pain|anxi\w*|stress|energi[sz]\w*|uplift\w*|euphori\w*|creativ\w*|focus|heal\w*|therap\w*|anti-?inflammator\w*|medicinal)\b/i, 'possible effect or health claim'],
  [/\b(best|award[- ]winning|#1|number one|top[- ]rated|favourite|favorite)\b/i, 'possible testimonial or superlative'],
  [/\b(weed|pot|marijuana|stoner|wake and bake|buzz)\b/i, 'term the OCS and others reject'],
  [/\b(cocktail|beer|wine|spirits|tobacco|cigarette)\b/i, 'association with alcohol or tobacco'],
  [/health canada approved/i, 'approval claim'],
];

// ---------------------------------------------------------------- validator

export function validateDocuments(docs, { asOf = new Date().toISOString().slice(0, 10) } = {}) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validateSchema = ajv.compile(schema);
  const issues = [];
  const add = (level, where, rule, msg) => issues.push({ level, where, rule, msg });

  // Flatten everything into products, lots and lab reports.
  const products = [], lots = [], reports = [];
  for (const { file, doc } of docs) {
    if (!validateSchema(doc)) {
      // Report errors from the branch matching @type, not the whole oneOf.
      const t = doc?.['@type'];
      const branch = ajv.compile({ $ref: `${schema.$id}#/$defs/${t}` });
      if (['CostaFeed', 'CostaProduct', 'CostaLot', 'CostaLabReport'].includes(t) && !branch(doc)) {
        for (const e of branch.errors) add('error', `${file}${e.instancePath}`, 'schema', `${e.message}${e.params?.allowedValues ? ` (${e.params.allowedValues.join(', ')})` : ''}${e.params?.additionalProperty ? ` (${e.params.additionalProperty})` : ''}`);
      } else {
        add('error', file, 'schema', `unknown or missing @type "${t}"`);
      }
      continue;
    }
    const push = (arr, x, w) => arr.push({ ...x, __where: w });
    if (doc['@type'] === 'CostaFeed') {
      (doc.products || []).forEach((p, i) => push(products, p, `${file}/products/${i}`));
      (doc.lots || []).forEach((l, i) => push(lots, l, `${file}/lots/${i}`));
      (doc.labReports || []).forEach((r, i) => push(reports, r, `${file}/labReports/${i}`));
    } else if (doc['@type'] === 'CostaProduct') push(products, doc, file);
    else if (doc['@type'] === 'CostaLot') push(lots, doc, file);
    else push(reports, doc, file);
  }
  for (const p of products) (p.lots || []).forEach((l, i) => lots.push({ ...l, __where: `${p.__where}/lots/${i}` }));

  const productById = new Map(products.map((p) => [p.costaId, p]));
  const reportById = new Map(reports.map((r) => [r.reportId, r]));

  // ---- lab reports (profile-independent)
  for (const r of reports) checkReport(r, add);

  // ---- products
  const gtinIndex = new Map(); // gtin -> [{product, assignment}]
  for (const p of products) {
    const w = p.__where;
    const profiles = p.conformsTo.map((id) => {
      if (!PROFILES[id]) add('error', `${w}/conformsTo`, 'profile', `unknown profile ${id}`);
      return PROFILES[id];
    }).filter(Boolean);
    const isCanada = p.conformsTo.some((id) => id.startsWith('ca-'));
    if (isCanada && !p.conformsTo.includes('ca-federal/2.0'))
      add('error', `${w}/conformsTo`, 'profile', 'Canadian provincial profiles require ca-federal/2.0 as well');

    // GTIN assignments
    const assigns = p.identifiers.gtins;
    assigns.forEach((a, i) => {
      if (!gtinCheckDigitOk(a.gtin)) add('error', `${w}/identifiers/gtins/${i}`, 'gtin-check-digit', `GTIN ${a.gtin} has an invalid check digit`);
      if (a.validThrough && day(a.validThrough) < day(a.validFrom)) add('error', `${w}/identifiers/gtins/${i}`, 'gtin-window', 'validThrough is before validFrom');
      if (a.status === 'retired' && !a.validThrough) add('error', `${w}/identifiers/gtins/${i}`, 'gtin-window', 'a retired GTIN assignment needs validThrough');
      if (a.status === 'retired' && !a.retiredReason) add('warning', `${w}/identifiers/gtins/${i}`, 'gtin-window', 'retired GTIN assignment has no retiredReason');
      if (a.gs1CompanyPrefix && !a.gtin.slice(1).startsWith(a.gs1CompanyPrefix) && !a.gtin.startsWith(a.gs1CompanyPrefix))
        add('warning', `${w}/identifiers/gtins/${i}`, 'gtin-prefix', `GTIN ${a.gtin} does not start with company prefix ${a.gs1CompanyPrefix}`);
      if (a.packagingLevel !== 'consumerUnit' && !a.childGtin) add('warning', `${w}/identifiers/gtins/${i}`, 'gtin-hierarchy', `${a.packagingLevel} should name its childGtin and childQuantity`);
      if (!gtinIndex.has(a.gtin)) gtinIndex.set(a.gtin, []);
      gtinIndex.get(a.gtin).push({ p, a, i });
    });
    if (!assigns.some((a) => a.packagingLevel === 'consumerUnit'))
      add('error', `${w}/identifiers/gtins`, 'gtin-hierarchy', 'no consumerUnit GTIN');
    if (p.status === 'active' && !assigns.some((a) => a.packagingLevel === 'consumerUnit' && a.status === 'active'))
      add('error', `${w}/identifiers/gtins`, 'gtin-hierarchy', 'active product has no active consumerUnit GTIN');

    if (isCanada) checkCanadaFederal(p, add, asOf);
    for (const prof of profiles) if (prof.id !== 'ca-federal') checkProvincial(p, prof, add, asOf);
  }

  // GTIN overlap across all products seen (the recycled-GTIN problem).
  for (const [gtin, uses] of gtinIndex) {
    for (let i = 0; i < uses.length; i++) for (let j = i + 1; j < uses.length; j++) {
      const A = uses[i], B = uses[j];
      const aEnd = A.a.validThrough ? day(A.a.validThrough) : Infinity;
      const bEnd = B.a.validThrough ? day(B.a.validThrough) : Infinity;
      const overlap = day(A.a.validFrom) <= bEnd && day(B.a.validFrom) <= aEnd;
      const same = A.p.costaId === B.p.costaId;
      if (overlap) add('error', `${B.p.__where}/identifiers/gtins/${B.i}`, 'gtin-conflict', `GTIN ${gtin} is assigned to ${same ? 'this product twice' : `${A.p.costaId} and ${B.p.costaId}`} in overlapping periods`);
      else if (!same) add('warning', `${B.p.__where}/identifiers/gtins/${B.i}`, 'gtin-reuse', `GTIN ${gtin} was also used by ${A.p.costaId} in a different period. Consumers must resolve by lot or date (spec 5.4)`);
    }
  }

  // ---- lots
  for (const l of lots) {
    const w = l.__where;
    if (!gtinCheckDigitOk(l.gtin)) add('error', `${w}/gtin`, 'gtin-check-digit', `GTIN ${l.gtin} has an invalid check digit`);
    const p = productById.get(l.product);
    if (day(l.packagingDate) > day(asOf)) add('error', `${w}/packagingDate`, 'lot-dates', 'packagingDate is in the future');
    if (l.expiryDate && day(l.expiryDate) <= day(l.packagingDate)) add('error', `${w}/expiryDate`, 'lot-dates', 'expiryDate is not after packagingDate');
    if (l.expiryDate && l.stabilityDataOnFile !== true) add('error', `${w}/expiryDate`, 'ca-expiry', 'an expiry date may only be printed if stability data is on file (Cannabis Regulations s. 123.02(1)); set stabilityDataOnFile');
    if (!p) { add('warning', w, 'lot-product', `product ${l.product} not in this validation set; product-dependent lot checks skipped`); continue; }
    if (p.status === 'neverProduced') add('error', w, 'lot-product', 'product status is neverProduced but has a lot');
    const a = p.identifiers.gtins.find((g) => g.gtin === l.gtin && g.packagingLevel === 'consumerUnit');
    if (!a) add('error', `${w}/gtin`, 'lot-gtin', `lot GTIN ${l.gtin} is not a consumerUnit GTIN of ${p.costaId}`);
    else if (day(l.packagingDate) < day(a.validFrom) || (a.validThrough && day(l.packagingDate) > day(a.validThrough)))
      add('error', `${w}/packagingDate`, 'lot-gtin', `packagingDate ${l.packagingDate} is outside the GTIN assignment window ${a.validFrom}..${a.validThrough || 'open'}`);
    const isCanada = p.conformsTo.some((id) => id.startsWith('ca-'));
    if (isCanada) checkLotCanada(p, l, reportById, add);
    for (const id of p.conformsTo) {
      const prof = PROFILES[id];
      if (prof && prof.id !== 'ca-federal') checkLotProvincial(p, l, prof, reportById, add, asOf);
    }
  }
  return issues;
}

// ---------------------------------------------------------------- federal rules (ca-federal)

function checkCanadaFederal(p, add, asOf) {
  const w = p.__where;
  const c = p.classOfCannabis;
  if (!FORMS_BY_CLASS[c].includes(p.productForm))
    add('error', `${w}/productForm`, 'class-form', `productForm "${p.productForm}" is not compatible with class "${c}" (allowed: ${FORMS_BY_CLASS[c].join(', ')})`);
  if (c === 'edible cannabis') {
    if (!p.edibleForm) add('error', `${w}/edibleForm`, 'edible-form', 'edibleForm is required for edible cannabis');
    if (p.intendedUse && p.intendedUse !== 'ingestion') add('error', `${w}/intendedUse`, 'intended-use', 'edible cannabis is for ingestion');
  } else if (p.edibleForm) add('error', `${w}/edibleForm`, 'edible-form', 'edibleForm is only for edible cannabis');
  const needsUse = (c === 'cannabis extracts' || c === 'cannabis topicals' || ((c === 'dried cannabis' || c === 'fresh cannabis') && p.discreteUnits));
  if (needsUse && !p.intendedUse) add('error', `${w}/intendedUse`, 'intended-use', `intendedUse is required for ${c}${p.discreteUnits ? ' in discrete units' : ''}`);
  if (c === 'cannabis topicals' && p.intendedUse && p.intendedUse !== 'topical') add('error', `${w}/intendedUse`, 'intended-use', 'cannabis topicals are for topical use');

  // net content units
  const n = p.netContent;
  const expectUnit = c === 'cannabis plants' || c === 'cannabis plant seeds' ? 'count'
    : c === 'edible cannabis' ? (p.edibleForm === 'solid' ? 'g' : 'mL') : 'g';
  if (n.unit !== expectUnit) add('error', `${w}/netContent/unit`, 'net-content', `${c}${p.edibleForm ? ` (${p.edibleForm})` : ''} is labelled in ${expectUnit}, not ${n.unit}`);
  if (p.discreteUnits && !['cannabis plants', 'cannabis plant seeds'].includes(c)) {
    if (!p.unitCount) add('error', `${w}/unitCount`, 'discrete-units', 'unitCount is required for products in discrete units');
    if (!p.unitNetContent) add('error', `${w}/unitNetContent`, 'discrete-units', 'unitNetContent is required for products in discrete units');
    if (p.unitCount && p.unitNetContent && p.unitNetContent.unit === n.unit && Math.abs(p.unitCount * p.unitNetContent.value - n.value) > 0.02 * n.value)
      add('warning', `${w}/unitNetContent`, 'discrete-units', `unitCount x unitNetContent (${p.unitCount * p.unitNetContent.value}) does not match netContent (${n.value})`);
  }

  // potency basis on the product-level ranges
  const basis = labelBasis(p);
  const pot = p.potency || {};
  for (const [field, units] of Object.entries(basis.required)) {
    if (!pot[field]) add('error', `${w}/potency/${field}`, 'label-basis', `${field} range is required (Cannabis Regulations ${basis.cite})`);
    else if (!units.includes(pot[field].unit)) add('error', `${w}/potency/${field}/unit`, 'label-basis', `${field} must be in ${units.join(' or ')} (${basis.cite}), not ${pot[field].unit}`);
  }
  for (const field of basis.forbidden) if (pot[field]) add('error', `${w}/potency/${field}`, 'label-basis', `${field} is not a label statement for this product type (${basis.cite})`);
  for (const [field, r] of Object.entries(pot)) if (r.min > r.max) add('error', `${w}/potency/${field}`, 'range', 'min is greater than max');

  checkThcCaps(p, Object.fromEntries(Object.entries(pot).map(([k, r]) => [k, { unit: r.unit, value: r.max }])), `${w}/potency`, add, 'product range max');

  // Schedule 3 equivalency
  const eq = expectedDriedEquivalent(p);
  if (p.driedEquivalentGrams && eq !== undefined && Math.abs(eq - p.driedEquivalentGrams) > Math.max(0.01, 0.01 * eq))
    add('warning', `${w}/driedEquivalentGrams`, 'equivalency', `Schedule 3 gives ${+eq.toFixed(3)} g for this net content, not ${p.driedEquivalentGrams}`);

  // content rules (section 7)
  const texts = [['name', p.name], ['descriptions/short', p.descriptions?.short], ['descriptions/long', p.descriptions?.long], ['flavour', p.flavour]];
  for (const [path, lt] of texts) for (const [lang, s] of Object.entries(lt || {})) for (const [re, why] of CLAIM_PATTERNS) {
    const m = s.match(re);
    if (m) add('warning', `${w}/${path}/${lang}`, 'content', `"${m[0]}": ${why}. Review against the promotion rules in s. 17 and following of the Cannabis Act before publishing`);
  }
  if (p.status === 'neverProduced' && (p.lots || []).length) add('error', `${w}/lots`, 'lot-product', 'neverProduced product has lots');
}

function checkThcCaps(p, vals, where, add, label) {
  const c = p.classOfCannabis;
  const ingestedLike = INGESTED_LIKE.includes(p.intendedUse) || c === 'edible cannabis';
  if (c === 'edible cannabis' && vals.totalThc?.unit === 'mg' && vals.totalThc.value > 10)
    add('error', `${where}/totalThc`, 'thc-cap', `edible cannabis may not exceed 10 mg THC per immediate container (s. 102.7); ${label} is ${vals.totalThc.value} mg`);
  if (c !== 'edible cannabis' && ingestedLike && p.discreteUnits && vals.totalThcPerUnit?.unit === 'mg' && vals.totalThcPerUnit.value > 10)
    add('error', `${where}/totalThcPerUnit`, 'thc-cap', `discrete units for ${p.intendedUse} may not exceed 10 mg THC per unit (s. 96); ${label} is ${vals.totalThcPerUnit.value} mg`);
  if (vals.totalThcPerActivation?.value > 10 && ingestedLike)
    add('error', `${where}/totalThcPerActivation`, 'thc-cap', `may not exceed 10 mg THC per activation (s. 132.12(2)); ${label} is ${vals.totalThcPerActivation.value} mg`);
  if (c === 'cannabis extracts' || c === 'cannabis topicals') {
    const mg = containerThcMg(p, vals);
    if (mg !== undefined && mg > 1000) add('error', where, 'thc-cap', `extracts and topicals may not exceed 1000 mg THC per immediate container (s. 101.2); ${label} works out to ${+mg.toFixed(1)} mg`);
  }
}

function checkLotCanada(p, l, reportById, add) {
  const w = l.__where;
  if (p.classOfCannabis === 'edible cannabis' && l.expiryDate) add('error', `${w}/expiryDate`, 'ca-expiry', 'edible cannabis labels must not include an expiry date (s. 123.02(2))');
  const basis = labelBasis(p);
  const lp = l.labelledPotency || {};
  for (const [field, units] of Object.entries(basis.required)) {
    if (!lp[field]) add('error', `${w}/labelledPotency/${field}`, 'label-basis', `${field} is a mandatory label statement (${basis.cite})`);
    else if (!units.includes(lp[field].unit)) add('error', `${w}/labelledPotency/${field}/unit`, 'label-basis', `${field} must be in ${units.join(' or ')} (${basis.cite})`);
  }
  for (const field of basis.forbidden) if (lp[field]) add('error', `${w}/labelledPotency/${field}`, 'label-basis', `${field} is not a label statement for this product type (${basis.cite})`);
  checkThcCaps(p, lp, `${w}/labelledPotency`, add, 'labelled value');
  for (const [field, q] of Object.entries(lp)) {
    const r = p.potency?.[field];
    if (r && r.unit === q.unit && (q.value < r.min || q.value > r.max))
      add('warning', `${w}/labelledPotency/${field}`, 'range', `labelled ${q.value} ${q.unit} is outside the product range ${r.min}-${r.max}; most provinces require notice`);
  }

  // Lab reports: s. 90-92. Final-form potency is required for every lot.
  const refs = l.labReports || [];
  const finals = refs.filter((r) => r.scope === 'finalForm');
  if (!finals.length) { add('warning', `${w}/labReports`, 'lab-final-form', 'no final-form lab report referenced (s. 90(2) requires final-form potency testing of every lot; provinces require the COA)'); return; }
  for (const ref of finals) {
    const r = reportById.get(ref.reportId);
    if (!r) { add('warning', `${w}/labReports`, 'lab-ref', `lab report ${ref.reportId} not in this validation set; not checked`); continue; }
    if (r.sample.lotNumber !== l.lotNumber) add('error', `${w}/labReports`, 'lab-ref', `lab report ${r.reportNumber} is for lot ${r.sample.lotNumber}, not ${l.lotNumber}`);
    if (r.sample.sampleType !== 'finalForm') add('error', `${w}/labReports`, 'lab-ref', `lab report ${r.reportNumber} sampleType is ${r.sample.sampleType}, referenced as finalForm`);
    if (ref.sha256 && r.document && ref.sha256 !== r.document.sha256) add('error', `${w}/labReports`, 'lab-ref', `sha256 does not match lab report ${r.reportNumber} document`);
    if (r.overallConformance === 'fail') add('error', `${w}/labReports`, 'lab-fail', `lab report ${r.reportNumber} failed; this lot must not be sold`);
    const panels = new Set(r.panels.map((x) => x.panel));
    const pot = r.panels.find((x) => x.panel === 'potency');
    const names = new Set((pot?.results || []).map((x) => norm(x.analyte)));
    for (const a of ['thc', 'thca', 'cbd', 'cbda']) if (!names.has(a)) add('error', `${w}/labReports`, 'lab-required-analytes', `lab report ${r.reportNumber} is missing ${a.toUpperCase()} (s. 90(1) requires THC, THCA, CBD and CBDA)`);
    if (!['cannabis plants', 'cannabis plant seeds'].includes(p.classOfCannabis)) {
      for (const pn of ['microbial', 'heavyMetals']) if (!panels.has(pn)) add('error', `${w}/labReports`, 'lab-contaminants', `lab report ${r.reportNumber} has no ${pn} panel (s. 91 contaminant testing)`);
      if (!panels.has('mycotoxins')) add('warning', `${w}/labReports`, 'lab-contaminants', `lab report ${r.reportNumber} has no mycotoxins panel`);
    }
    const solventsUsed = (p.processing?.extractionMethods || []).some((m) => ['ethanol', 'hydrocarbon', 'other'].includes(m)) || (p.processing?.solventsUsed || []).length;
    if (solventsUsed && !panels.has('residualSolvents')) add('error', `${w}/labReports`, 'lab-solvents', `solvent-extracted product but lab report ${r.reportNumber} has no residualSolvents panel`);
    const needsDiss = p.discreteUnits && INGESTED_LIKE.includes(p.intendedUse) && p.classOfCannabis !== 'edible cannabis';
    if (needsDiss && !panels.has('dissolution') && !panels.has('disintegration')) add('error', `${w}/labReports`, 'lab-dissolution', `discrete units for ${p.intendedUse} need dissolution or disintegration testing (s. 91.1, 95)`);
    if (pot) compareLabelToLab(p, l, pot, r, add);
  }
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^delta9/, '').replace(/^d9/, '');

// Converts a lab value to the unit of a label statement where possible.
function toLabelUnit(p, res, labelField, labelUnit) {
  let { value, unit } = res;
  if (unit === '%') { value *= 10; unit = 'mg/g'; }
  if (unit === labelUnit && !labelField.endsWith('PerUnit')) return value;
  if (labelField.endsWith('PerUnit')) {
    if (unit === 'mg/unit' && labelUnit === 'mg') return value;
    if (unit === 'mg/g' && labelUnit === 'mg' && p.unitNetContent?.unit === 'g') return value * p.unitNetContent.value;
    if (unit === 'mg/mL' && labelUnit === 'mg' && p.unitNetContent?.unit === 'mL') return value * p.unitNetContent.value;
    if (unit === 'mg/g' && labelUnit === 'mg/g') return value;
    return undefined;
  }
  if (labelUnit === 'mg') {
    if (unit === 'mg/package') return value;
    if (unit === 'mg/unit' && p.unitCount) return value * p.unitCount;
    if (unit === 'mg/g' && p.netContent.unit === 'g') return value * p.netContent.value;
    if (unit === 'mg/mL' && p.netContent.unit === 'mL') return value * p.netContent.value;
  }
  return undefined;
}

function compareLabelToLab(p, l, pot, r, add) {
  const w = l.__where;
  const find = (n) => pot.results.find((x) => norm(x.analyte) === n);
  const total = (base) => {
    const t = find(`total${base}`);
    const a = find(base), acid = find(`${base}a`);
    let computed;
    if (a && acid && a.unit === acid.unit) {
      const av = a.qualifier === '=' ? a.value : 0, cv = acid.qualifier === '=' ? acid.value : 0;
      computed = { value: av + 0.877 * cv, unit: a.unit };
    }
    if (t && t.qualifier === '=' && computed && t.unit === computed.unit && Math.abs(t.value - computed.value) > Math.max(0.05, 0.01 * computed.value))
      add('error', `${w}/labReports`, 'lab-total-calc', `lab report ${r.reportNumber}: Total ${base.toUpperCase()} ${t.value} does not equal ${base.toUpperCase()} + 0.877 x ${base.toUpperCase()}A = ${+computed.value.toFixed(3)} ${t.unit}`);
    return t && t.qualifier === '=' ? { value: t.value, unit: t.unit } : computed;
  };
  const measured = { Thc: total('thc'), Cbd: total('cbd') };
  for (const [field, q] of Object.entries(l.labelledPotency || {})) {
    const m = field.match(/^total(Thc|Cbd)(PerUnit)?$/);
    if (!m) continue;
    const meas = measured[m[1]];
    if (!meas) continue;
    const v = toLabelUnit(p, meas, field, q.unit);
    if (v === undefined) { add('warning', `${w}/labelledPotency/${field}`, 'label-vs-lab', `cannot convert lab unit ${meas.unit} to label unit ${q.unit} for comparison`); continue; }
    if (q.value === 0) continue;
    const ratio = v / q.value;
    const tol = tolerance(p, q.value);
    if (tol && (ratio < tol[0] || ratio > tol[1]))
      add('error', `${w}/labelledPotency/${field}`, 'label-vs-lab', `measured ${+v.toFixed(2)} ${q.unit} is ${Math.round(ratio * 100)}% of labelled ${q.value}; s. 97 allows ${Math.round(tol[0] * 100)}-${Math.round(tol[1] * 100)}%`);
    if (!tol && (ratio < 0.8 || ratio > 1.2) && q.value >= 10)
      add('warning', `${w}/labelledPotency/${field}`, 'label-vs-lab', `measured ${+v.toFixed(1)} ${q.unit} is ${Math.round(ratio * 100)}% of labelled ${q.value}. No regulatory tolerance applies to this class, but the label must not be misleading`);
  }
}

function checkReport(r, add) {
  const w = r.__where;
  const seq = [['sample.collectedDate', r.sample.collectedDate], ['sample.receivedDate', r.sample.receivedDate], ['analysisStarted', r.analysisStarted], ['analysisCompleted', r.analysisCompleted], ['issuedDate', r.issuedDate]].filter(([, d]) => d);
  for (let i = 1; i < seq.length; i++) if (day(seq[i][1]) < day(seq[i - 1][1])) add('error', w, 'lab-dates', `${seq[i][0]} (${seq[i][1]}) is before ${seq[i - 1][0]} (${seq[i - 1][1]})`);
  if (!r.laboratory.accreditations.length) add('warning', `${w}/laboratory`, 'lab-accreditation', 'no accreditation listed (provinces expect ISO/IEC 17025)');
  for (const [i, a] of r.laboratory.accreditations.entries()) if (a.validThrough && day(a.validThrough) < day(r.issuedDate)) add('error', `${w}/laboratory/accreditations/${i}`, 'lab-accreditation', `accreditation expired ${a.validThrough}, before the report was issued`);
  if (!r.laboratory.healthCanadaLicenceNumber) add('warning', `${w}/laboratory`, 'lab-licence', 'no Health Canada analytical testing licence number');
  let anyFail = false;
  r.panels.forEach((pn, i) => {
    if (pn.status === 'fail') anyFail = true;
    if (pn.status !== 'notTested' && !(pn.results || []).length) add('error', `${w}/panels/${i}`, 'lab-results', `${pn.panel} panel has status ${pn.status} but no results`);
    if (pn.status !== 'notTested' && !pn.method) add('warning', `${w}/panels/${i}`, 'lab-method', `${pn.panel} panel has no method`);
    (pn.results || []).forEach((x, j) => {
      const at = `${w}/panels/${i}/results/${j}`;
      if (['=', '>ULOQ'].includes(x.qualifier) && typeof x.value !== 'number') add('error', at, 'lab-results', `${x.analyte}: qualifier ${x.qualifier} needs a value`);
      if (x.conforms === false) {
        if (pn.status === 'pass') add('error', at, 'lab-results', `${x.analyte} does not conform but the ${pn.panel} panel is marked pass`);
        anyFail = true;
      }
      if (typeof x.limit === 'number' && x.qualifier === '=' && x.conforms !== undefined) {
        const lt = x.limitType || 'max';
        const ok = lt === 'max' ? x.value <= x.limit : lt === 'min' ? x.value >= x.limit : true;
        if (ok !== x.conforms) add('error', at, 'lab-results', `${x.analyte}: value ${x.value} vs ${lt} limit ${x.limit} contradicts conforms=${x.conforms}`);
      }
    });
  });
  if (anyFail && r.overallConformance === 'pass') add('error', w, 'lab-results', 'a panel or result failed but overallConformance is pass');
  if (r.visibility === 'public' && !r.document) add('warning', w, 'lab-document', 'public report has no document (PDF) reference');
}

// ---------------------------------------------------------------- provincial profiles

function checkProvincial(p, prof, add, asOf) {
  const w = p.__where;
  const R = prof.rules || {};
  const tag = prof.id;
  for (const loc of R.requireLocales || []) {
    if (!p.name?.[loc]) add('error', `${w}/name/${loc}`, tag, `name.${loc} is required`);
  }
  const reqPaths = [...(R.requireFields || []), ...(R.requireFieldsByClass?.[p.classOfCannabis] || []), ...(R.requireFieldsByForm?.[p.productForm] || [])];
  for (const path of reqPaths) if (get(p, path) === undefined || (Array.isArray(get(p, path)) && !get(p, path).length)) add('error', `${w}/${path.replace(/\./g, '/')}`, tag, `${path} is required`);
  for (const lvl of R.requireGtinLevels || []) if (!p.identifiers.gtins.some((g) => g.packagingLevel === lvl && g.status === 'active')) add('error', `${w}/identifiers/gtins`, tag, `an active ${lvl} GTIN is required`);
  if (R.requireProductPotencyRange && !p.potency) add('error', `${w}/potency`, tag, 'potency ranges are required at item setup');
  if (R.prohibitedClasses?.includes(p.classOfCannabis)) add('error', `${w}/classOfCannabis`, tag, `${p.classOfCannabis} is not sold in this jurisdiction`);
  if (R.prohibitedForms?.includes(p.productForm)) add('error', `${w}/productForm`, tag, `${p.productForm} is not accepted in this jurisdiction`);
  if (R.descriptionMaxLength) for (const k of ['short', 'long']) for (const [lang, s] of Object.entries(p.descriptions?.[k] || {}))
    if (R.descriptionMaxLength[k] && s.length > R.descriptionMaxLength[k]) add('error', `${w}/descriptions/${k}/${lang}`, tag, `${k} description is ${s.length} characters; limit is ${R.descriptionMaxLength[k]}`);
  if (R.minImages && (p.media || []).filter((m) => !m.role.startsWith('labelArtwork') && m.role !== 'logo').length < R.minImages) add('error', `${w}/media`, tag, `at least ${R.minImages} product image(s) required`);
  for (const role of R.requireMediaRoles || []) if (!(p.media || []).some((m) => m.role === role)) add('error', `${w}/media`, tag, `media with role ${role} is required`);
  if (R.requireHealthCanadaNotice && !p.identifiers.healthCanadaProductNotice) add('error', `${w}/identifiers/healthCanadaProductNotice`, tag, 'Health Canada new product notice ID is required');
  if (R.requireDriedEquivalent && !p.driedEquivalentGrams) add('error', `${w}/driedEquivalentGrams`, tag, 'dried cannabis equivalency is required');
  if (R.requireListing && !(p.jurisdictions || []).some((j) => j.jurisdiction === prof.jurisdiction)) add('warning', `${w}/jurisdictions`, tag, `no listing entry for ${prof.jurisdiction}`);
  // barcodes
  for (const [i, g] of p.identifiers.gtins.entries()) {
    if (g.status !== 'active') continue;
    const bc = (g.barcodes || []).filter((b) => !b.jurisdictions || b.jurisdictions.includes(prof.jurisdiction));
    const allowed = R.barcode?.symbologies?.[g.packagingLevel];
    const reqAIs = R.barcode?.requiredAIs?.[g.packagingLevel];
    if ((allowed || reqAIs) && !bc.length) { add('error', `${w}/identifiers/gtins/${i}/barcodes`, tag, `${g.packagingLevel} barcode details are required`); continue; }
    for (const [k, b] of bc.entries()) {
      const at = `${w}/identifiers/gtins/${i}/barcodes/${k}`;
      if (allowed && !allowed.includes(b.symbology)) add('error', at, tag, `${b.symbology} is not accepted for ${g.packagingLevel} (accepted: ${allowed.join(', ')})`);
      const aiCapable = ['GS1 DataMatrix', 'GS1 DataBar Expanded', 'GS1 DataBar Expanded Stacked', 'GS1-128'].includes(b.symbology);
      if (!aiCapable && b.applicationIdentifiers.some((ai) => ai !== '01')) add('error', at, tag, `${b.symbology} cannot carry application identifiers other than the GTIN`);
      if (aiCapable) for (const ai of reqAIs || []) if (!b.applicationIdentifiers.includes(ai)) add('error', at, tag, `AI (${ai}) is required on the ${g.packagingLevel} barcode`);
      for (const ai of R.barcode?.forbiddenAIs || []) if (b.applicationIdentifiers.includes(ai)) add('error', at, tag, `AI (${ai}) is not accepted`);
    }
  }
  // potency caps specific to the jurisdiction
  const pot = p.potency || {};
  if (R.maxThcMgPerGNonEdible && p.classOfCannabis !== 'edible cannabis' && pot.totalThc?.unit === 'mg/g' && pot.totalThc.max > R.maxThcMgPerGNonEdible)
    add('error', `${w}/potency/totalThc`, tag, `THC may not exceed ${R.maxThcMgPerGNonEdible} mg/g (${R.maxThcMgPerGNonEdible / 10}% w/w) in non-edible products`);
  if (R.maxEdibleThcMgPerUnit && p.classOfCannabis === 'edible cannabis' && pot.totalThcPerUnit?.max > R.maxEdibleThcMgPerUnit)
    add('error', `${w}/potency/totalThcPerUnit`, tag, `edible units may not exceed ${R.maxEdibleThcMgPerUnit} mg THC`);
  if (R.maxNonSolidEdibleThcMgPerContainer && p.classOfCannabis === 'edible cannabis' && p.edibleForm !== 'solid' && pot.totalThc?.max > R.maxNonSolidEdibleThcMgPerContainer)
    add('error', `${w}/potency/totalThc`, tag, `liquid edibles may not exceed ${R.maxNonSolidEdibleThcMgPerContainer} mg THC per container`);
}

function checkLotProvincial(p, l, prof, reportById, add, asOf) {
  const w = l.__where;
  const R = prof.rules || {};
  const tag = prof.id;
  if (R.lotNumber?.maxLength && l.lotNumber.length > R.lotNumber.maxLength) add('error', `${w}/lotNumber`, tag, `lot number longer than ${R.lotNumber.maxLength} characters`);
  if (R.lotNumber?.forbiddenChars) { const bad = [...l.lotNumber].filter((ch) => R.lotNumber.forbiddenChars.includes(ch)); if (bad.length) add('error', `${w}/lotNumber`, tag, `lot number contains characters the distribution centre cannot scan: ${[...new Set(bad)].join(' ')}`); }
  if (R.requireLabReportPerLot) {
    const finals = (l.labReports || []).filter((x) => x.scope === 'finalForm');
    if (!finals.length) add('error', `${w}/labReports`, tag, 'a final-form COA is required for every lot');
    if (R.labReportDocumentRequired) for (const ref of finals) { const r = reportById.get(ref.reportId); if (r && !r.document) add('error', `${w}/labReports`, tag, `COA ${r.reportNumber} needs a document (PDF) reference`); }
  }
  const age = (day(asOf) - day(l.packagingDate)) / DAY_MS;
  const group = Object.entries(R.freshness?.groups || {}).find(([, forms]) => forms.includes(p.productForm))?.[0];
  const lim = group && R.freshness.limitsDays[group];
  if (lim?.inbound && age > lim.inbound) add('warning', `${w}/packagingDate`, tag, `packaged ${Math.floor(age)} days ago; inbound limit for ${group} is ${lim.inbound} days`);
  if (lim?.quarantine && age > lim.quarantine) add('warning', `${w}/packagingDate`, tag, `packaged ${Math.floor(age)} days ago; past the ${lim.quarantine}-day quarantine limit for ${group}`);
  if (R.minShelfLifeDays && l.expiryDate && (day(l.expiryDate) - day(asOf)) / DAY_MS < R.minShelfLifeDays) add('warning', `${w}/expiryDate`, tag, `less than ${R.minShelfLifeDays} days of shelf life left`);
}

// ---------------------------------------------------------------- CLI

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  let asOf; let json = false; const files = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--as-of') asOf = args[++i];
    else if (args[i] === '--json') json = true;
    else files.push(args[i]);
  }
  if (!files.length) { console.error('usage: validate.mjs [--as-of YYYY-MM-DD] [--json] files...'); process.exit(2); }
  const docs = files.map((f) => ({ file: f, doc: JSON.parse(readFileSync(f, 'utf8')) }));
  const issues = validateDocuments(docs, asOf ? { asOf } : {});
  if (json) console.log(JSON.stringify(issues, null, 2));
  else for (const i of issues) console.log(`${i.level.toUpperCase().padEnd(7)} ${i.rule.padEnd(22)} ${i.where}\n        ${i.msg}`);
  const errors = issues.filter((i) => i.level === 'error').length;
  if (!json) console.log(`\n${errors} error(s), ${issues.length - errors} warning(s)`);
  process.exit(errors ? 1 : 0);
}
