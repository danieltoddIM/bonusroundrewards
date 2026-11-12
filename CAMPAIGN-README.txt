FIX THE CAMPAIGN 404s

1. Unzip this archive.
2. Open the bonusroundrewards repository on GitHub, on the main branch.
3. Click Add file > Upload files.
4. Drag the site, scripts and templates FOLDERS and vercel.json into the upload.
   Preserve the folder structure. Campaign HTML must be INSIDE site/.
   Uploading just the HTML files at the repository root will not publish them.
5. Commit the changes (or create a branch and merge its pull request).
6. In Vercel, wait for the deployment of this NEW commit to finish. If the
   previous rollback remains pinned in production, promote the new deployment.
7. Open each URL below before scanning again:
   https://bonusroundrewards.com/scrabble-tv
   https://bonusroundrewards.com/trivia-tv
   https://bonusroundrewards.com/scrabble-social
   https://bonusroundrewards.com/trivia-social
   https://bonusroundrewards.com/play

The consumer homepage is preserved. Its only change is the small Campaign QR
test link at the bottom. The grid is /qr-test, not /. It is marked noindex.

Your QR code images do NOT need to change or be regenerated.
The six campaign pages embed their fonts and QR images: no extra asset upload
is required. The build and Vercel config retain their inline script/font rules.
Set const ONELINK_URL = "" near the top of each campaign HTML to its final
HTTPS AppsFlyer OneLink later. Redeploy to activate the immediate redirect.

Prepared against main commit 34f94988cd7cba34593cfe91d848b17676f6e64a.
Build and 2,919 structural checks passed; homepage main content verified
unchanged. No live deployment was changed by this preparation.
