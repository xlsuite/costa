// Shared JSON Schema <-> XML mapping for COSTA 2.0.
// Mapping rules (normative, see spec section 9):
//  - the root element is the document's @type; @context and @id are not carried in XML
//  - each JSON property becomes a child element with the same name, in JSON Schema property order
//  - an array becomes the property element repeated once per item
//  - null values and empty arrays are omitted
//  - extensions become <extension key="prefix:name">value</extension>
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const NS = 'https://gocosta.org/ns/2.0';
export const schema = JSON.parse(readFileSync(join(ROOT, 'schemas/costa-2.0.schema.json'), 'utf8'));
export const DEFS = schema.$defs;
export const SKIP = new Set(['@context', '@type', '@id']);

export const deref = (s) => (s && s.$ref ? DEFS[s.$ref.split('/').pop()] : s);
export const refName = (s) => (s && s.$ref ? s.$ref.split('/').pop() : null);
export const isObjectDef = (s) => { const d = deref(s); return d && d.type === 'object'; };

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function toXml(doc) {
  const type = doc['@type'];
  const out = ['<?xml version="1.0" encoding="UTF-8"?>'];
  out.push(`<${type} xmlns="${NS}">`);
  writeObject(doc, DEFS[type], out, '  ');
  out.push(`</${type}>`);
  return out.join('\n') + '\n';
}

function writeObject(obj, def, out, ind) {
  def = deref(def);
  if (refName({ $ref: '#/$defs/Extensions' }) && def === DEFS.Extensions) {
    for (const [k, v] of Object.entries(obj)) out.push(`${ind}<extension key="${esc(k)}">${esc(typeof v === 'string' ? v : JSON.stringify(v))}</extension>`);
    return;
  }
  for (const [key, pdef] of Object.entries(def.properties)) {
    if (SKIP.has(key) || obj[key] === undefined || obj[key] === null) continue;
    const vals = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
    const itemDef = pdef.type === 'array' ? pdef.items : pdef;
    for (const v of vals) {
      if (v === null) continue;
      if (isObjectDef(itemDef)) { out.push(`${ind}<${key}>`); writeObject(v, itemDef, out, ind + '  '); out.push(`${ind}</${key}>`); }
      else out.push(`${ind}<${key}>${esc(v)}</${key}>`);
    }
  }
}

// Minimal XML reader for COSTA documents (elements, text, one attribute on <extension>).
export function fromXml(xml) {
  xml = xml.replace(/<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '');
  let i = 0;
  const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  function node() {
    i = xml.indexOf('<', i);
    const m = /^<([A-Za-z_][\w.-]*)((?:\s+[\w:.-]+="[^"]*")*)\s*(\/?)>/.exec(xml.slice(i));
    if (!m) throw new Error(`bad XML near ${xml.slice(i, i + 40)}`);
    i += m[0].length;
    const attrs = Object.fromEntries([...m[2].matchAll(/([\w:.-]+)="([^"]*)"/g)].map((a) => [a[1], unesc(a[2])]));
    const n = { name: m[1], attrs, children: [], text: '' };
    if (m[3]) return n;
    for (;;) {
      const lt = xml.indexOf('<', i);
      n.text += xml.slice(i, lt); i = lt;
      if (xml.startsWith('</', i)) { i = xml.indexOf('>', i) + 1; n.text = unesc(n.text); return n; }
      n.children.push(node());
    }
  }
  const root = node();
  return readObject(root, DEFS[root.name]);
}

function scalar(text, def) {
  def = deref(def);
  const t = Array.isArray(def.type) ? def.type.find((x) => x !== 'null') : def.type;
  if (t === 'number' || t === 'integer') return Number(text);
  if (t === 'boolean') return text.trim() === 'true';
  return text;
}

function readObject(n, def) {
  def = deref(def);
  if (def === DEFS.Extensions) return Object.fromEntries(n.children.map((c) => [c.attrs.key, c.text]));
  const o = {};
  if (def.properties['@type']?.const) o['@type'] = def.properties['@type'].const;
  for (const c of n.children) {
    const pdef = def.properties[c.name];
    if (!pdef) throw new Error(`unexpected element <${c.name}> in ${n.name}`);
    const isArr = pdef.type === 'array';
    const itemDef = isArr ? pdef.items : pdef;
    const v = isObjectDef(itemDef) ? readObject(c, itemDef) : scalar(c.text, itemDef);
    if (isArr) (o[c.name] ||= []).push(v); else o[c.name] = v;
  }
  return o;
}
