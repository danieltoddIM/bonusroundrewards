#!/usr/bin/env node
/**
 * Static release checks for Bonus Round. No third-party dependencies.
 * Run after `npm run build`; add --launch to reject unresolved release copy.
 * This verifies artifacts, not real inbox delivery, app flows, or legal approval.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'site');
const strict = process.argv.includes('--launch');
const errors = [];
const warnings = [];
const expected = ['', 'how-it-works', 'faq', 'support', 'privacy-policy', 'terms', 'account-deletion', 'do-not-sell', 'rewards-rules', 'about', 'cookies', 'download'];
const domain = 'https://bonusroundrewards.com';
const source = new Map();
const idSets = new Map();
let checks = 0;

function assert(condition, message) {
  checks += 1;
  if (!condition) errors.push(message);
}
function warn(message) { warnings.push(message); }
function relative(file) { return path.relative(site, file).split(path.sep).join('/'); }
function read(file) {
  if (!source.has(file)) source.set(file, fs.readFileSync(file, 'utf8'));
  return source.get(file);
}
function allFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? allFiles(file) : [file];
  });
}
function attrs(text) {
  const result = {};
  const pattern = /([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const match of text.matchAll(pattern)) result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  return result;
}
function cleanMarkup(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b([^>]*)>[\s\S]*?<\/\1>/gi, '<$1$2></$1>');
}
function elements(html, tagPattern = '[a-z][\\w:-]*') {
  return [...cleanMarkup(html).matchAll(new RegExp(`<(${tagPattern})\\b([^>]*)>`, 'gi'))]
    .map(match => ({ tag: match[1].toLowerCase(), a: attrs(match[2]), index: match.index, raw: match[0] }));
}
function decode(text = '') {
  return text.replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&#x([a-f\d]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}
function pageURL(file) {
  const rel = relative(file);
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -11);
  return '/' + rel;
}
function resolveLocal(value, from) {
  if (!value || /^(?:data:|mailto:|tel:|javascript:|blob:)/i.test(value)) return null;
  let parsed;
  try { parsed = new URL(decode(value), domain + pageURL(from)); } catch { return { invalid: true }; }
  if (parsed.origin !== domain) return null;
  let pathname;
  try { pathname = decodeURIComponent(parsed.pathname); } catch { return { invalid: true }; }
  let candidate = path.resolve(site, '.' + pathname);
  if (candidate !== site && !candidate.startsWith(site + path.sep)) return { invalid: true };
  const candidates = [candidate, candidate + '.html', path.join(candidate, 'index.html')];
  candidate = candidates.find(f => fs.existsSync(f) && fs.statSync(f).isFile());
  return { file: candidate, pathname, hash: parsed.hash ? decodeURIComponent(parsed.hash.slice(1)) : '' };
}
function idsFor(file) {
  if (!idSets.has(file)) idSets.set(file, new Set(elements(read(file)).flatMap(el => el.a.id ? [el.a.id] : [])));
  return idSets.get(file);
}
function typesIn(value, found = new Set()) {
  if (Array.isArray(value)) value.forEach(item => typesIn(item, found));
  else if (value && typeof value === 'object') {
    const types = value['@type'];
    (Array.isArray(types) ? types : [types]).filter(Boolean).forEach(type => found.add(type));
    Object.values(value).forEach(item => typesIn(item, found));
  }
  return found;
}

assert(fs.existsSync(path.join(site, 'index.html')), 'Missing site/index.html. Run npm run build first.');
const files = allFiles(site);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const publicFiles = htmlFiles.filter(file => !relative(file).startsWith('partners/'));
const partnerFiles = htmlFiles.filter(file => relative(file).startsWith('partners/'));
for (const slug of expected) assert(fs.existsSync(path.join(site, slug, 'index.html')), `Missing public page: /${slug}`);
assert(fs.existsSync(path.join(site, '404.html')), 'Missing custom 404.html page.');

for (const file of htmlFiles) {
  const html = read(file);
  const label = relative(file);
  const els = elements(html);
  const partner = label.startsWith('partners/');
  const publicPage = !partner;
  if (publicPage) assert(!/\{\{(?:[a-z][\w:-]*)\}\}/i.test(html), `${label}: unresolved build-template token.`);
  const ids = els.flatMap(el => el.a.id ? [el.a.id] : []);
  assert(ids.length === new Set(ids).size, `${label}: duplicate id attribute.`);

  for (const el of els) {
    for (const key of ['href', 'src', 'poster']) {
      if (!(key in el.a)) continue;
      const value = el.a[key];
      if (key === 'href' && el.tag === 'a') assert(value.trim() !== '' && value.trim() !== '#', `${label}: empty link target.`);
      const target = resolveLocal(value, file);
      if (!target) continue;
      assert(!target.invalid, `${label}: invalid local URL ${value}`);
      if (target.invalid) continue;
      assert(Boolean(target.file), `${label}: missing local ${key} target ${value}`);
      if (target.file && target.hash && target.file.endsWith('.html')) {
        assert(idsFor(target.file).has(target.hash), `${label}: missing anchor ${value}`);
      }
      if (publicPage && el.tag === 'a') assert(!target.pathname.startsWith('/partners'), `${label}: public link exposes unlisted partner archive: ${value}`);
    }
    if (el.a.srcset) {
      for (const candidate of el.a.srcset.split(',')) {
        const value = candidate.trim().split(/\s+/)[0];
        const target = resolveLocal(value, file);
        if (target) assert(!target.invalid && Boolean(target.file), `${label}: missing srcset target ${value}`);
      }
    }
    if (publicPage && el.tag === 'img') {
      assert('alt' in el.a, `${label}: image has no alt attribute: ${el.a.src || '(no src)'}`);
      assert(Boolean(el.a.width && el.a.height), `${label}: image has no explicit width/height: ${el.a.src || '(no src)'}`);
    }
    if (publicPage && ['input', 'select', 'textarea'].includes(el.tag) && !['hidden', 'submit', 'button', 'reset'].includes(el.a.type)) {
      const explicitLabel = el.a.id && els.some(item => item.tag === 'label' && item.a.for === el.a.id);
      const before = cleanMarkup(html).slice(0, el.index);
      const wrapped = before.lastIndexOf('<label') > before.lastIndexOf('</label>');
      assert(Boolean(explicitLabel || wrapped || el.a['aria-label'] || el.a['aria-labelledby']), `${label}: unlabeled ${el.tag} ${el.a.name || el.a.id || ''}`);
    }
    if (publicPage && el.a['aria-labelledby']) {
      for (const id of el.a['aria-labelledby'].trim().split(/\s+/)) assert(ids.includes(id), `${label}: aria-labelledby references missing ${id}`);
    }
    if (publicPage && el.a['aria-describedby']) {
      for (const id of el.a['aria-describedby'].trim().split(/\s+/)) assert(ids.includes(id), `${label}: aria-describedby references missing ${id}`);
    }
  }

  const robots = els.filter(el => el.tag === 'meta' && ['robots', 'googlebot'].includes((el.a.name || '').toLowerCase())).map(el => el.a.content || '').join(',');
  if (partner) {
    assert(/\bnoindex\b/i.test(robots), `${label}: archived proposal must contain a noindex meta tag.`);
    continue;
  }
  assert(!/\bnoindex\b/i.test(robots), `${label}: public page contains noindex.`);
  assert(/^\s*<!doctype html>/i.test(html), `${label}: missing HTML5 doctype.`);
  assert(els.some(el => el.tag === 'html' && el.a.lang), `${label}: missing html lang.`);
  assert(els.some(el => el.tag === 'meta' && el.a.name === 'viewport'), `${label}: missing viewport metadata.`);
  assert(/<title>\s*[^<]+<\/title>/i.test(html), `${label}: missing page title.`);
  assert(els.some(el => el.tag === 'meta' && el.a.name === 'description' && el.a.content), `${label}: missing description.`);
  assert(els.filter(el => el.tag === 'h1').length === 1, `${label}: expected one h1.`);
  assert(els.some(el => el.tag === 'header') && els.some(el => el.tag === 'footer'), `${label}: missing shared header or footer.`);
  assert(els.some(el => el.tag === 'main'), `${label}: missing main landmark.`);
  assert(els.some(el => el.tag === 'a' && el.a.href?.startsWith('#') && /skip/i.test(html.slice(html.indexOf(el.raw), html.indexOf(el.raw) + 250))), `${label}: missing skip navigation link.`);
  const canonical = els.find(el => el.tag === 'link' && el.a.rel === 'canonical')?.a.href;
  const expectedCanonical = domain + (label === '404.html' ? '/404' : pageURL(file));
  assert(canonical === expectedCanonical, `${label}: canonical should be ${expectedCanonical}; found ${canonical || 'none'}.`);
  for (const key of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type']) assert(els.some(el => el.tag === 'meta' && el.a.property === key && el.a.content), `${label}: missing ${key}.`);
  for (const key of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) assert(els.some(el => el.tag === 'meta' && el.a.name === key && el.a.content), `${label}: missing ${key}.`);
  assert(els.some(el => el.tag === 'meta' && el.a.property === 'og:url' && el.a.content === canonical), `${label}: og:url does not match the canonical URL.`);
  for (const image of els.filter(el => el.tag === 'meta' && (el.a.property === 'og:image' || el.a.name === 'twitter:image'))) {
    const target = resolveLocal(image.a.content, file);
    if (target) assert(!target.invalid && Boolean(target.file), `${label}: missing social-sharing image ${image.a.content}`);
  }
  assert(els.some(el => el.tag === 'link' && /\bicon\b/.test(el.a.rel || '')), `${label}: missing favicon.`);

  const jsonld = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(match => attrs(match[1]).type === 'application/ld+json');
  const types = new Set();
  for (const match of jsonld) {
    try { typesIn(JSON.parse(match[2]), types); checks += 1; }
    catch (error) { assert(false, `${label}: invalid JSON-LD: ${error.message}`); }
  }
  if (label === 'index.html') {
    assert(types.has('Organization'), 'Home page JSON-LD is missing Organization.');
    assert(types.has('MobileApplication'), 'Home page JSON-LD is missing MobileApplication.');
  }
  const visible = cleanMarkup(html).replace(/<[^>]*>/g, ' ');
  const placeholders = [...new Set(visible.match(/\[[^\]]{1,2000}\]/g) || [])];
  const previewPlaceholder = value => value.length > 110 ? value.slice(0, 107) + '…]' : value;
  if (placeholders.length) warn(`${label}: ${placeholders.length} unresolved copy placeholder(s): ${placeholders.slice(0,4).map(previewPlaceholder).join(', ')}${placeholders.length > 4 ? ', …' : ''}`);
  if (strict && placeholders.length) assert(false, `${label}: release copy still contains bracketed placeholders.`);
  if (strict && /DRAFT\s+FOR\s+ATTORNEY\s+REVIEW/i.test(visible)) assert(false, `${label}: attorney-review draft notice remains.`);
}

for (const file of files.filter(file => file.endsWith('.css'))) {
  for (const match of read(file).matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) {
    const target = resolveLocal(match[1], file);
    if (target) assert(!target.invalid && Boolean(target.file), `${relative(file)}: missing CSS asset ${match[1]}`);
  }
}

const sitemapPath = path.join(site, 'sitemap.xml');
assert(fs.existsSync(sitemapPath), 'Missing sitemap.xml.');
if (fs.existsSync(sitemapPath)) {
  const sitemap = read(sitemapPath);
  const urls = [...sitemap.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(match => decode(match[1].trim()));
  assert(urls.length > 0, 'Sitemap contains no URLs.');
  assert(urls.length === new Set(urls).size, 'Sitemap contains duplicate URLs.');
  for (const slug of expected) assert(urls.includes(domain + '/' + slug), `Sitemap is missing /${slug}.`);
  for (const url of urls) {
    assert(url.startsWith(domain + '/'), `Sitemap contains a noncanonical origin: ${url}`);
    assert(!/\/partners(?:\/|$)|\/404(?:\.html)?(?:\/|$)/.test(url), `Sitemap exposes an archive or error URL: ${url}`);
    const target = resolveLocal(url, path.join(site, 'index.html'));
    assert(Boolean(target?.file), `Sitemap target missing: ${url}`);
  }
}
const robotsPath = path.join(site, 'robots.txt');
assert(fs.existsSync(robotsPath), 'Missing robots.txt.');
if (fs.existsSync(robotsPath)) {
  const robots = read(robotsPath);
  assert(!/^\s*Disallow:\s*\/\s*$/mi.test(robots), 'robots.txt blocks the entire site.');
  assert(!/^\s*Disallow:\s*\/partners/mi.test(robots), 'Do not block /partners in robots.txt: crawlers must see noindex.');
  assert(robots.includes(domain + '/sitemap.xml'), 'robots.txt lacks the canonical sitemap URL.');
}
for (const name of ['partners/index.html', 'partners/economics-model/index.html', 'partners/install-model/index.html']) assert(fs.existsSync(path.join(site, name)), `Missing preserved archive: ${name}`);

const manifestPath = path.join(site, 'site.webmanifest');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(read(manifestPath));
    for (const icon of manifest.icons || []) {
      const target = resolveLocal(icon.src, manifestPath);
      assert(Boolean(target?.file), `Manifest icon missing: ${icon.src}`);
    }
  } catch (error) { assert(false, `Invalid site.webmanifest: ${error.message}`); }
}

const vercelPath = path.join(root, 'vercel.json');
if (fs.existsSync(vercelPath)) {
  try {
    const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    for (const slug of ['economics-model', 'install-model']) assert((vercel.redirects || []).some(rule => rule.source === '/' + slug && rule.destination === '/partners/' + slug && rule.permanent), `Missing permanent Vercel redirect for /${slug}.`);
    for (const rule of vercel.headers || []) {
      if ((rule.headers || []).some(header => header.key.toLowerCase() === 'x-robots-tag' && /noindex/i.test(header.value))) {
        assert(rule.source.startsWith('/partners'), `Vercel noindex header affects a public path: ${rule.source}`);
      }
    }
  } catch (error) { assert(false, `Invalid vercel.json: ${error.message}`); }
}

const configPath = path.join(root, 'config', 'site.json');
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const outstanding = [];
    function inspect(value, key = '') {
      if (typeof value === 'string' && /\[[^\]]+\]|\bTODO\b|\bTBD\b/i.test(value)) outstanding.push(key);
      else if (Array.isArray(value)) value.forEach((v, i) => inspect(v, `${key}[${i}]`));
      else if (value && typeof value === 'object') Object.entries(value).forEach(([k,v]) => inspect(v, key ? `${key}.${k}` : k));
      if ((value === null || value === '') && /(?:app.?store|google.?play|supported.?countries|deletion.?path|redemption.?time)/i.test(key)) outstanding.push(key);
    }
    inspect(config);
    if (strict) {
      for (const key of ['legalApproved', 'operationsVerified', 'publicAssetsApproved', 'contactInboxesVerified']) {
        if (key in config) assert(config[key] === true, `Launch confirmation is not complete: ${key}.`);
      }
      for (const [key, hostname] of [['appStoreUrl', 'apps.apple.com'], ['googlePlayUrl', 'play.google.com']]) {
        if (!config[key]) continue;
        try {
          const store = new URL(config[key]);
          assert(store.protocol === 'https:' && store.hostname === hostname, `${key} must be an official HTTPS ${hostname} listing URL.`);
        } catch { assert(false, `${key} is not a valid URL.`); }
      }
    }
    if (outstanding.length) warn(`config/site.json: unresolved launch fields: ${[...new Set(outstanding)].join(', ')}`);
    if (strict) assert(!outstanding.length, 'Launch configuration still contains required placeholders.');
  } catch (error) { assert(false, `Invalid config/site.json: ${error.message}`); }
}

const uniqueErrors = [...new Set(errors)];
const uniqueWarnings = [...new Set(warnings)];
if (uniqueWarnings.length) {
  console.log(`\nPrelaunch content (${uniqueWarnings.length}):`);
  uniqueWarnings.forEach(message => console.log(`  - ${message}`));
}
if (uniqueErrors.length) {
  console.error(`\nFAILED: ${uniqueErrors.length} issue(s), ${checks} checks, ${publicFiles.length} public/error pages, ${partnerFiles.length} archived pages.`);
  uniqueErrors.forEach(message => console.error(`  - ${message}`));
  process.exitCode = 1;
} else {
  console.log(`\nPASS: ${checks} static checks; ${publicFiles.length} public/error pages; ${partnerFiles.length} archived pages.`);
  if (!strict && uniqueWarnings.length) console.log('Release placeholders are intentional in this package. Run with --launch after completing the launch checklist.');
  console.log('Static checks do not certify WCAG conformance, legal approval, mailbox delivery, or real app/account-deletion behavior.');
}
