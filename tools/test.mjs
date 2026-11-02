#!/usr/bin/env node
// Runs the validator over every example. Valid examples must have no errors.
// Each file in examples/invalid must fail with at least the rules listed in expected.json.
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { validateDocuments, gtinCheckDigitOk } from './validate.mjs';
import { toXml, fromXml } from './xml.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AS_OF = '2026-11-02';
let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) failed++; };
const load = (f) => ({ file: f, doc: JSON.parse(readFileSync(f, 'utf8')) });

// unit checks
ok(gtinCheckDigitOk('00012345678905'), 'GTIN check digit: valid GTIN-12 padded to 14');
ok(!gtinCheckDigitOk('00012345678906'), 'GTIN check digit: invalid digit rejected');

for (const f of readdirSync(join(ROOT, 'examples')).filter((f) => f.endsWith('.json'))) {
  const issues = validateDocuments([load(join(ROOT, 'examples', f))], { asOf: AS_OF });
  const errs = issues.filter((i) => i.level === 'error');
  ok(errs.length === 0, `valid example ${f}${errs.length ? `: ${errs.map((e) => `${e.rule}: ${e.msg}`).join('; ')}` : ''}`);
}

// XML: every valid example must convert to XML that passes the XSD, and convert back losslessly.
const canon = (v) => Array.isArray(v) ? v.map(canon) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).filter((k) => !['@context', '@id'].includes(k) && v[k] !== null && !(Array.isArray(v[k]) && !v[k].length)).sort().map((k) => [k, canon(v[k])])) : v;
let xmllint = true;
try { execFileSync('xmllint', ['--version'], { stdio: 'ignore' }); } catch { xmllint = false; console.log('skip xmllint not installed; XSD checks skipped'); }
const tmp = mkdtempSync(join(tmpdir(), 'costa-'));
for (const f of readdirSync(join(ROOT, 'examples')).filter((f) => f.endsWith('.json'))) {
  const doc = JSON.parse(readFileSync(join(ROOT, 'examples', f), 'utf8'));
  const xml = toXml(doc);
  const back = fromXml(xml);
  ok(JSON.stringify(canon(back)) === JSON.stringify(canon(doc)), `XML round trip ${f}`);
  ok(validateDocuments([{ file: f, doc: back }], { asOf: AS_OF }).every((i) => i.level !== 'error'), `XML round trip ${f} still validates`);
  const committed = join(ROOT, 'examples/xml', f.replace(/\.json$/, '.xml'));
  ok(readFileSync(committed, 'utf8') === xml, `examples/xml/${f.replace(/\.json$/, '.xml')} is current`);
  if (xmllint) {
    const p = join(tmp, 'x.xml'); writeFileSync(p, xml);
    let pass = true; try { execFileSync('xmllint', ['--noout', '--schema', join(ROOT, 'schemas/costa-2.0.xsd'), p], { stdio: 'pipe' }); } catch { pass = false; }
    ok(pass, `XSD validates ${f}`);
  }
}

const expected = JSON.parse(readFileSync(join(ROOT, 'examples/invalid/expected.json'), 'utf8'));
for (const [name, rules] of Object.entries(expected)) {
  const issues = validateDocuments([load(join(ROOT, 'examples/invalid', `${name}.json`))], { asOf: AS_OF });
  const seen = new Set(issues.map((i) => i.rule));
  const missing = rules.filter((r) => !seen.has(r));
  ok(missing.length === 0, `invalid example ${name} triggers ${rules.join(', ')}${missing.length ? ` (missing ${missing.join(', ')}; got ${[...seen].join(', ') || 'nothing'})` : ''}`);
}
console.log(failed ? `\n${failed} test(s) failed` : '\nall tests passed');
process.exit(failed ? 1 : 0);
