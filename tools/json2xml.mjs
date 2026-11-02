#!/usr/bin/env node
// Convert COSTA JSON to XML, or XML to JSON with --to-json.
// Usage: node tools/json2xml.mjs file.json > file.xml
//        node tools/json2xml.mjs --to-json file.xml > file.json
import { readFileSync } from 'node:fs';
import { toXml, fromXml } from './xml.mjs';
const args = process.argv.slice(2);
if (args[0] === '--to-json') process.stdout.write(JSON.stringify(fromXml(readFileSync(args[1], 'utf8')), null, 2) + '\n');
else process.stdout.write(toXml(JSON.parse(readFileSync(args[0], 'utf8'))));
