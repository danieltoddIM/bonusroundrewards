BONUS ROUND REWARDS — CAMPAIGN ADD-ON

The regular consumer homepage is NOT included or replaced by this add-on.
The scan-test grid is qr-test.html, available at /qr-test. It is noindex.
Add a small link near the bottom of the existing site footer:
<a href="/qr-test">Campaign QR test</a>

Copy the five campaign HTML files, qr-test.html, and qrcodes/ into the existing
published site root (site/ in the earlier source package). Preserve index.html.
Keep cleanUrls enabled. Merge the campaign-specific header rules from
vercel-existing-site.json if your site applies a Content Security Policy.
The standalone vercel.json has no homepage redirect or rewrite.

Each HTML embeds the site's stylesheet, Manrope font and its own QR.
Near the top of each campaign HTML, set const ONELINK_URL = "" to that
campaign's final HTTPS AppsFlyer OneLink. Empty = Coming Soon; non-empty =
immediate redirect with no second click. Redeploy after editing.

QRs encode the exact production URLs, with no shortener. Local generation,
ECC H, four-module quiet zone, PNGs at least 2000x2000 plus SVGs. PNG and SVG
export decode results are in QR-VERIFICATION.csv and QR-VERIFICATION.txt.
Test the final encoded promo video on real phones before broadcast.
The production campaign routes require deployment before scans will resolve.
Tracking IDs identify the pages; attribution must be configured in OneLink.
