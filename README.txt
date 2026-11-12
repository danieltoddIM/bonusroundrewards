BONUS ROUND REWARDS — TV AND SOCIAL QR CAMPAIGN

CONTENTS
Five self-contained HTML landing pages, index.html scan-test grid, ten QR exports
(PNG + SVG), campaign-manifest.json, QR verification results, and vercel.json.
Each landing HTML embeds the existing site's Manrope font, complete stylesheet,
play-button wordmark and its own QR PNG. No external asset dependency is needed.
All five pages share the same template; badge, tracking ID and QR identify each one.

DEPLOYMENT TO VERCEL
Unzip this folder. For a separate preview project, import/upload this directory
as a static Vercel project: Framework = Other, no install/build command, output
folder = . (project root). Retain vercel.json. cleanUrls enables /scrabble-tv,
/trivia-tv, /scrabble-social, /trivia-social and /play without .html.

IMPORTANT: YOUR EXISTING PRODUCTION HOME PAGE
index.html in THIS package is the scan-test grid, not your consumer homepage.
When adding this campaign to the existing bonusroundrewards.com deployment:
1. Preserve your existing homepage, pages, assets and hosting configuration.
2. Add the five landing HTML files and qrcodes/ to the published site root.
   In the earlier Bonus Round source package, that is the site/ directory.
3. Save this package's index.html as qr-test.html in that same root so the grid
   is available at /qr-test without replacing the consumer homepage.
4. Keep cleanUrls: true in the existing vercel.json. Merge configuration;
   do not replace existing redirects/security headers with this minimal file.
5. vercel-existing-site.json contains a ready-to-merge copy of your earlier
   site's Vercel configuration. It preserves outputDirectory: site, build,
   existing redirects and headers, and adds route-specific CSP rules for these
   campaign pages and /qr-test. These permit the embedded font and scripts.
   Use it as vercel.json only if your current project still uses that structure;
   otherwise merge its six added header rules into your current configuration.
   Those six new campaign routes permit inline scripts so you can paste a
   OneLink and redeploy without recalculating script hashes. Existing public
   and partner route policies remain unchanged.
6. Deploy the updated existing project with bonusroundrewards.com attached.
   A second project cannot use the same production domain concurrently.

The codes always encode https://bonusroundrewards.com followed by their route;
they do not switch to a staging domain. They will not work on the intended domain
until the five pages are deployed there. Preview project links may be tested
with Open landing page; scanning still opens the exact production URL.

FUTURE APPSFLYER REDIRECT
Open EACH of the five landing HTML files and find this near the top:
const ONELINK_URL = "";
Paste that campaign's final HTTPS AppsFlyer OneLink between the quotes. Save and
redeploy. Non-empty values trigger window.location.replace immediately from
the document head, with no second click. Empty values show Coming Soon.
Keep all five QR files unchanged: they continue pointing at your permanent
landing URLs, which then forward to the corresponding OneLink.
The tracking ID is an identification label, not an analytics integration.
Configure campaign attribution in each OneLink when it is supplied.

QR PRODUCTION AND TESTING
Generated locally, without an online QR service. Exact HTTPS URLs, black on
white, error correction H, four-module quiet zone. PNGs use integer module
scaling and are at least 2000 x 2000. SVGs have a solid white background.
PNG and SVG exports are independently decoded with ZXing-C++; results are
included in QR-VERIFICATION.csv and QR-VERIFICATION.txt.
Keep the entire white border visible in video and test the final encoded video
on real phones at expected viewing size/distance. Do not crop, stretch, overlay
logos, or place text over the QR code. High resolution alone does not ensure
scanability after video resizing or compression.
