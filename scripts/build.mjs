import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'site');
const config = JSON.parse(await readFile(path.join(root, 'config/site.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const iconPaths = {
  round:'<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  game:'<path d="M7 7h10c3 0 4 3 4 6l.4 4a2.4 2.4 0 0 1-4.1 1.8L15 16H9l-2.3 2.8A2.4 2.4 0 0 1 2.6 17L3 13c0-3 1-6 4-6Z"/><path d="M7 10v5m-2.5-2.5h5M16 11h.01M18 14h.01"/>',
  gift:'<path d="M3 9h18v4H3zM5 13v8h14v-8M12 9v12"/><path d="M12 9c-7 0-7-7-3-6 3 .8 3 6 3 6Zm0 0c7 0 7-7 3-6-3 .8-3 6-3 6Z"/>',
  discover:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  shield:'<path d="m12 3 8 4v5c0 5-8 9-8 9s-8-4-8-9V7l8-4Z"/><path d="m8 12 3 3 5-6"/>',
  points:'<circle cx="12" cy="12" r="9"/><path d="m12 6 1.7 3.6 4 .6-2.8 2.8.7 4-3.6-1.9L8.4 17l.7-4-2.8-2.8 4-.6L12 6Z"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5 3 3 5-5"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  location:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  person:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4m-3 14h2"/>',
  play:'<path d="m5 3 16 9L5 21V3Z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  spark:'<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${iconPaths[name] || iconPaths.spark}</svg>`;
const storeButtons = () => `<div class="store-buttons">${[
  ['App Store',config.appStoreUrl,'phone'],['Google Play',config.googlePlayUrl,'play']
].map(([name,url,mark]) => `<a class="store-badge" href="${escape(url || '/download')}"${url ? ' rel="external"' : ''} aria-label="${url ? 'Download Bonus Round on ' : 'Bonus Round coming soon on '}${name}">${icon(mark)}<span><small>${url ? 'Download on' : 'Coming soon on'}</small><strong>${name}</strong></span></a>`).join('')}</div>`;
const anyStoreLive = Boolean(config.appStoreUrl || config.googlePlayUrl);
const allStoresLive = Boolean(config.appStoreUrl && config.googlePlayUrl);
const storeStatus = allStoresLive ? 'Find Bonus Round on iPhone and Android.' : anyStoreLive ? 'Check app availability for your device.' : 'Coming soon on iPhone and Android.';
const availabilityCards = () => `<div class="availability">${[
  ['App Store','iPhone',config.appStoreUrl,'phone'],['Google Play','Android',config.googlePlayUrl,'play']
].map(([name,device,url,mark])=>`<section class="availability-card">${icon(mark)}<h2>${name}</h2><p>${url ? `Visit the official Bonus Round listing for ${device}. Check supported devices and country availability in the store.` : `For ${device}. Check back for the official Bonus Round ${name} listing.`}</p>${url ? `<p><a class="button button-navy" href="${escape(url)}" rel="external">View on ${name} ${icon('arrow')}</a></p>` : '<span class="pill">Coming soon</span>'}</section>`).join('')}</div>`;
const previewNotice = 'Illustrative app previews. Games, brands, points, bonuses and gift card values shown are examples, not confirmed live offers or partnerships.';
const downloadCTA = () => `<section class="shell" aria-labelledby="download-cta-heading"><div class="download-cta"><div><span class="eyebrow">Make time for a little play</span><h2 id="download-cta-heading">Your next round could be a rewarding one.</h2><p>Discover games. Work toward a goal. Choose a gift card. That’s Bonus Round.</p></div><div>${storeButtons()}<p class="store-note">${config.appStoreUrl || config.googlePlayUrl ? 'Availability depends on your device and location.' : 'Download links will be added at launch.'}</p></div></div></section>`;
const brands = () => `<div class="brand-strip" aria-label="Gift card brand placeholders">${(config.giftCardBrands.length ? config.giftCardBrands : ['[Gift card brand 1]','[Gift card brand 2]','[Gift card brand 3]']).map(name => `<div class="brand-slot">${escape(name)}</div>`).join('')}</div><p class="brand-strip-note">${config.giftCardBrands.length ? 'Selection and availability may vary. Check the app for the current catalog.' : 'Gift card selection will be confirmed at launch. Brand spaces are placeholders.'}</p>`;
const pages = [
 {slug:'',file:'home',title:'Play games. Earn gift cards.',description:'Discover games, earn points through eligible gameplay, and redeem gift cards with Bonus Round. Explore how it works and get ready for your next round.',kind:'public',layout:'home'},
 {slug:'how-it-works',title:'How it works',heading:'A little play. A little progress. A reward you choose.',description:'Learn how to discover eligible games, earn Bonus Round points, explore bonuses and daily streaks, and redeem gift cards.',intro:'From finding a game to choosing a gift card, here’s how your next round works.',kind:'public'},
 {slug:'faq',title:'Frequently asked questions',heading:'Good questions. Clear answers.',description:'Find help with Bonus Round accounts, points, rewards, tracking, eligibility, and account deletion.',intro:'Start here for the details on playing, earning and redeeming.',kind:'public'},
 {slug:'support',title:'Support & contact',heading:'Let’s get you back to playing.',description:'Contact Bonus Round support for help with your account, game progress, points, or gift card redemption.',intro:'Need a hand with a game, your points or a reward? Tell us what happened.',kind:'public'},
 {slug:'about',title:'About Bonus Round',heading:'A little more to look forward to.',description:'Learn about Bonus Round, the mobile rewards app operated by Bonus Round Rewards LLC, an Arizona limited liability company.',intro:'We’re building a simple way to turn eligible gameplay into progress toward a gift card you choose.',kind:'public'},
 {slug:'privacy-policy',title:'Privacy Policy',heading:'Privacy Policy',description:'Bonus Round’s draft Privacy Policy explains information practices, advertising identifiers, data rights, retention, and privacy contacts.',intro:'How information is handled when you use Bonus Round and this website.',kind:'legal',draft:true},
 {slug:'terms',title:'Terms of Use',heading:'Terms of Use',description:'Review the draft Bonus Round Terms of Use, including eligibility, accounts, points, gift cards, program integrity and dispute terms.',intro:'The terms for using Bonus Round, earning points and redeeming rewards.',kind:'legal',draft:true},
 {slug:'account-deletion',title:'Account & data deletion',heading:'Your account. Your choice.',description:'Find in-app and email instructions for requesting deletion of your Bonus Round account and associated personal information.',intro:'How to request deletion of your Bonus Round account and associated personal information.',kind:'legal'},
 {slug:'do-not-sell',title:'Do Not Sell or Share My Personal Information',heading:'Do Not Sell or Share My Personal Information',description:'Learn about Bonus Round privacy choices, Global Privacy Control, and how to request an opt-out from sale or sharing of personal information.',intro:'Choose how your personal information is used, and find the right way to make a privacy request.',kind:'legal'},
 {slug:'rewards-rules',title:'Rewards rules & official terms',heading:'The rules of the round.',description:'Read Bonus Round rewards rules for earning points, qualifying gameplay, bonuses, redemptions, gift cards and fair participation.',intro:'The details behind earning points and redeeming gift cards.',kind:'legal'},
 {slug:'cookies',title:'Cookies & preferences',heading:'Your privacy, your choice.',description:'Manage website cookie preferences and learn about essential storage, optional services and Global Privacy Control on Bonus Round.',intro:'Understand what this website stores and control your optional choices.',kind:'public',layout:'prose'},
 {slug:'download',title:'Get the Bonus Round app',description:'Bonus Round is preparing for launch on the App Store and Google Play. Find app download availability and eligibility information here.',kind:'public',layout:'download'},
 {slug:'404',title:'Page not found',description:'This Bonus Round page could not be found. Return home or contact support for help.',kind:'public',layout:'error'}
];
const headerSource = await readFile(path.join(root, 'templates/header.html'), 'utf8');
const footerSource = await readFile(path.join(root, 'templates/footer.html'), 'utf8');
function replaceTokens(text, page) {
  text = text.replace(/\{\{icon:([a-z-]+)\}\}/g, (_, name) => icon(name));
  text = text.replace(/\{\{active:([a-z-]+)\}\}/g, (_, slug) => page.slug === slug ? 'aria-current="page"' : '');
  text = text.replaceAll('{{storeButtons}}', storeButtons()).replaceAll('{{downloadCTA}}',downloadCTA()).replaceAll('{{brandStrip}}',brands()).replaceAll('{{previewNotice}}',escape(previewNotice));
  text = text.replaceAll('{{storeStatus}}',escape(storeStatus)).replaceAll('{{availabilityCards}}',availabilityCards());
  text = text.replaceAll('{{availabilityHeadline}}',anyStoreLive ? 'Your next round<br>starts here.' : 'A little play.<br>A little treat.<br>Coming soon.');
  text = text.replaceAll('{{availabilityIntro}}',anyStoreLive ? 'Use the official store listing for your device to discover Bonus Round.' : 'Bonus Round is getting ready for its next round. Official app download links will appear here when available.');
  text = text.replaceAll('{{availabilityNote}}',anyStoreLive ? 'For eligible adults 18+. Availability depends on your country and supported device. Review the applicable store listing and program terms.' : 'For eligible adults 18+. Country availability and supported devices will be confirmed before launch. No download or registration is available through this website yet.');
  text = text.replaceAll('{{downloadFaqStatus}}',anyStoreLive ? 'Use the official listing linked there for your device.' : 'Download links are coming soon. Check back for the official listing for your device.');
  text = text.replace(/\{\{([A-Za-z]+)\}\}/g, (token, key) => Object.hasOwn(config,key) ? escape(config[key]) : token);
  // The legal fragments retain explicit operational brackets until these values are confirmed.
  const substitutions = {
    '[Bonus Round Rewards LLC]':config.legalEntity,
    '[street, city, AZ ZIP]':config.mailingAddress,
    '[confirmed supported countries]':config.supportedCountries,
    '[confirmed redemption processing time]':config.redemptionTiming,
    '[confirmed in-app deletion path]':config.inAppDeletionPath,
    '[confirmed deletion timeline]':config.deletionTimeline,
    '[confirmed minimum redemption and point requirement]':config.minimumRedemption,
    '[effective date]':config.effectiveDate
  };
  for (const [before,after] of Object.entries(substitutions)) text = text.replaceAll(before,escape(after));
  return text;
}
const organization = {
  '@type':'Organization','@id':config.origin+'/#organization',name:config.name,legalName:config.legalEntity,url:config.origin+'/',
  logo:config.origin+'/assets/brand/icon-512.png',email:config.supportEmail,
  contactPoint:[{'@type':'ContactPoint',contactType:'customer support',email:config.supportEmail,url:config.origin+'/support'},{'@type':'ContactPoint',contactType:'privacy',email:config.privacyEmail,url:config.origin+'/do-not-sell'}]
};
const tocFrom = source => [...source.matchAll(/<h2\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)].map(match=>({id:match[1],text:match[2].replace(/<[^>]+>/g,'')}));
const sectionTocFrom = source => [...source.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*>\s*<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(match=>({id:match[1],text:match[2].replace(/<[^>]+>/g,'')}));

for (const page of pages) {
  if(page.slug === 'download' && anyStoreLive) page.description='Get Bonus Round from its official app store listing. Discover games, earn points through eligible gameplay, and choose gift cards.';
  if(config.legalApproved && page.draft) page.description=page.description.replace('draft ', '');
  const filename = page.file || page.slug;
  let source = await readFile(path.join(root,'content',page.kind,filename+'.html'),'utf8');
  source = replaceTokens(source,page);
  let body;
  if (['home','download','error'].includes(page.layout)) body = source;
  else {
    const hero = `<section class="page-hero"><div class="shell"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a>${icon('chevron')}<span aria-current="page">${escape(page.title)}</span></nav><h1>${escape(page.heading)}</h1><p class="lead">${escape(page.intro)}</p></div></section>`;
    if(page.kind === 'legal') {
      const toc = [...tocFrom(source),...sectionTocFrom(source)].filter((v,i,a)=>a.findIndex(x=>x.id===v.id)===i);
      body = hero + `<div class="shell content-section legal-layout"><nav class="legal-toc" aria-label="On this page"><h2>On this page</h2><ol>${toc.map(item=>`<li><a href="#${escape(item.id)}">${item.text}</a></li>`).join('')}</ol><p class="small">Questions?<br><a href="mailto:${escape(config.privacyEmail)}">Email our privacy team</a></p></nav><article class="prose" aria-label="${escape(page.title)}">${source}</article></div>`;
    } else if(page.layout === 'prose') body = hero + `<div class="shell content-section"><div class="prose">${source}</div></div>`;
    else body = hero + source;
  }
  const canonical = page.slug === '404' ? config.origin+'/404' : config.origin+(page.slug ? '/'+page.slug : '/');
  const graph = [organization];
  if(!page.slug) graph.push({'@type':'MobileApplication','@id':config.origin+'/#app',name:config.name,url:config.origin+'/',applicationCategory:'LifestyleApplication',operatingSystem:'Android, iOS',description:'Discover games, earn points through eligible gameplay, and redeem gift cards.',publisher:{'@id':config.origin+'/#organization'},...(config.appStoreUrl || config.googlePlayUrl ? {downloadUrl:[config.appStoreUrl,config.googlePlayUrl].filter(Boolean)} : {})});
  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(page.title)} | Bonus Round</title>
<meta name="description" content="${escape(page.description)}">
<meta name="theme-color" content="#102E50"><meta name="color-scheme" content="light">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Bonus Round"><meta property="og:locale" content="en_US"><meta property="og:title" content="${escape(page.title)} | Bonus Round"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${config.origin}/assets/brand/social-card.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Bonus Round. Play games. Earn gift cards.">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(page.title)} | Bonus Round"><meta name="twitter:description" content="${escape(page.description)}"><meta name="twitter:image" content="${config.origin}/assets/brand/social-card.png"><meta name="twitter:image:alt" content="Bonus Round. Play games. Earn gift cards.">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml"><link rel="icon" href="/assets/brand/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css"><script src="/assets/js/site.js" defer></script>
<script type="application/ld+json">${json({'@context':'https://schema.org','@graph':graph})}</script>
</head><body>
${replaceTokens(headerSource,page)}
<main id="main" tabindex="-1">${body}</main>
${replaceTokens(footerSource,page)}
</body></html>\n`;
  const destination = !page.slug ? path.join(out,'index.html') : page.slug === '404' ? path.join(out,'404.html') : path.join(out,page.slug,'index.html');
  await mkdir(path.dirname(destination),{recursive:true});
  await writeFile(destination,doc);
}

await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${config.origin}/sitemap.xml\n`);
await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter(p=>p.slug!=='404').map(p=>`  <url><loc>${config.origin}${p.slug?'/'+p.slug:'/'}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile(path.join(out,'site.webmanifest'),JSON.stringify({name:'Bonus Round',short_name:'Bonus Round',description:'Play games. Earn gift cards.',start_url:'/',display:'browser',background_color:'#f7f9f4',theme_color:'#102e50',icons:[{src:'/assets/brand/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/assets/brand/icon-512.png',sizes:'512x512',type:'image/png'}]},null,2)+'\n');

// Inline JSON-LD and the preserved partner scripts get explicit CSP hashes.
const scriptHashes = new Set();
for (const page of pages) {
  const file = page.slug === '404' ? path.join(out,'404.html') : path.join(out,page.slug,'index.html');
  const html = await readFile(file,'utf8');
  for (const match of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) scriptHashes.add("'sha256-"+createHash('sha256').update(match[1]).digest('base64')+"'");
}
for (const route of ['partners','partners/economics-model','partners/install-model']) {
  const html=await readFile(path.join(out,route,'index.html'),'utf8');
  for (const match of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) scriptHashes.add("'sha256-"+createHash('sha256').update(match[1]).digest('base64')+"'");
}
const csp = `default-src 'self'; script-src 'self' ${[...scriptHashes].join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' mailto:; upgrade-insecure-requests`;
const vercel = {
  '$schema':'https://openapi.vercel.sh/vercel.json',framework:null,buildCommand:'node scripts/build.mjs',installCommand:'',outputDirectory:'site',cleanUrls:true,trailingSlash:false,
  redirects:[
    {source:'/economics-model',destination:'/partners/economics-model',permanent:true},
    {source:'/install-model',destination:'/partners/install-model',permanent:true}
  ],
  headers:[
    {source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'X-Frame-Options',value:'DENY'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=()'},{key:'Content-Security-Policy',value:csp},{key:'Strict-Transport-Security',value:'max-age=31536000'}]},
    {source:'/partners',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'}]},
    {source:'/partners/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'}]},
    {source:'/assets/:path*',headers:[{key:'Cache-Control',value:'public, max-age=3600, must-revalidate'}]}
  ]
};
await writeFile(path.join(root,'vercel.json'),JSON.stringify(vercel,null,2)+'\n');
console.log(`Built ${pages.length} public pages. Preserved /partners and static assets. Vercel configuration and SEO files updated.`);
if(!config.legalApproved || !config.operationsVerified) console.log('Prelaunch content remains. Run npm run check:launch for release blockers.');
