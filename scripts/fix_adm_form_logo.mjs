// One-time: replace the admission FORM template's fuzzy running-header logo
// (a generic 900px SVG-wrapped PNG with a tiny tagline) with the crisp,
// purpose-built page-header brand logo used by the committee packets.
import { readFileSync, writeFileSync } from 'node:fs';

const FORM = 'public/templates/CareIndeed_Patient_Admission_Packet_Letter_Form_Logo.html';
const LOGO = 'public/ci-logo-packet-page.png';

function pngSize(buf) { // IHDR: width@16, height@20 (big-endian)
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const logo = readFileSync(LOGO);
const { w, h } = pngSize(logo);
const b64 = logo.toString('base64');
// Display the logo ~1.45in wide in the header margin box, preserving aspect.
const dispW = 1.45, dispH = +(dispW * h / w).toFixed(3);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dispW}in" height="${dispH}in" viewBox="0 0 ${w} ${h}"><image width="${w}" height="${h}" href="data:image/png;base64,${b64}"/></svg>`;
const svgUrl = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

let html = readFileSync(FORM, 'utf8');
const before = html;
// Replace the data URL inside every @top-left { content: url("…") } running header.
html = html.replace(/(@top-left\s*\{\s*content:\s*url\(")data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+("\))/g,
  (_m, a, b) => a + svgUrl + b);

const count = (before.match(/@top-left\s*\{\s*content:\s*url\("data:image\/svg\+xml;base64,/g) || []).length;
if (html === before) { console.error('NO replacement made — pattern not found'); process.exit(1); }
writeFileSync(FORM, html);
console.log(`logo: ${w}x${h} → ${dispW}x${dispH}in · replaced ${count} running-header logo(s) · file ${(html.length/1024).toFixed(0)}KB`);
