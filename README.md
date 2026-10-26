# Bonus Round public website

A static, mobile-first consumer website for **bonusroundrewards.com**, with the existing partnership proposal preserved under `/partners`. The package contains editable source files and a ready-to-serve `site/` directory. It uses semantic HTML, shared CSS, and small progressive-enhancement scripts; there is no client framework, third-party analytics, or form backend.

**This is a build-ready handoff with explicit launch inputs.** Company/address placeholders, store links, operational policies, and attorney-reviewed legal text must be completed before it becomes the live consumer site. The existing production website remains unchanged until this package is deployed.

## Run locally

Use Node.js with the package's declared supported version. No third-party package installation is needed for the build itself.

```sh
npm run build
npm run check
npm run serve
```

Open the local address printed by `serve`. Use the local server instead of opening an HTML file directly: navigation uses root-relative URLs. Run `build` again after changing source content, templates, or configuration; then rerun `check`.

Run `npm run check:launch` before release. It intentionally fails while legal drafts, missing business facts, missing store URLs or unconfirmed readiness flags remain. Passing the ordinary structural check does not mean those launch inputs have been approved.

## File map

```text
bonus-round/
├── README.md
├── LAUNCH-CHECKLIST.md
├── package.json
├── vercel.json
├── partner-migration-report.json
├── config/
│   └── site.json
├── content/
│   ├── public/              Consumer page content
│   └── legal/               Legal and privacy page content
├── templates/              Shared header and footer
├── scripts/
│   ├── build.mjs           Dependency-free static build
│   ├── check.mjs           Link, metadata and launch checks
│   ├── serve.mjs           Local static preview server
│   └── brand-assets.py     Optional PNG authoring helper
└── site/                   Deployable output, including assets and archive
    ├── index.html
    ├── [generated public HTML pages]
    ├── 404.html
    ├── robots.txt
    ├── sitemap.xml
    ├── assets/
    │   └── app/
    │       ├── discover.webp
    │       ├── daily-bonus.webp
    │       ├── bonus-unlocked.webp
    │       ├── my-games.webp
    │       └── rewards.webp
    └── partners/
        ├── index.html
        ├── economics-model/index.html
        ├── install-model/index.html
        ├── styles.css
        └── assets/
```

The tree groups generated page files for readability. The build reads `config/site.json`, `content/public/`, `content/legal/`, and the shared templates, then writes the public pages into `site/`. Edit those sources rather than generated pages. Keep the preserved `/partners` archive and its assets in the package.

`FILE-TREE.txt` lists every delivered file. CSS and browser JavaScript are authored directly in `site/assets/`; the build preserves them. Images and fonts are also committed assets. `brand-assets.py` is an optional authoring utility requiring Pillow and DejaVu Sans; the generated PNGs are included, so it is not part of installation, build or deployment. The self-hosted Manrope font's OFL license is included alongside it.

## Pages and URLs

| Public URL | Purpose |
| --- | --- |
| `/` | Consumer homepage and download calls to action |
| `/how-it-works` | Discovery, gameplay, points, bonuses, redemption, eligibility |
| `/faq` | Common account, tracking, rewards, and availability questions |
| `/support` | Support contact information and email-draft form |
| `/privacy-policy` | Draft privacy policy |
| `/terms` | Draft terms of use |
| `/account-deletion` | Account/data deletion instructions and email alternative |
| `/do-not-sell` | Privacy opt-out request instructions |
| `/rewards-rules` | Rewards program rules |
| `/about` | Company identity and mission |
| `/cookies` | Website storage and consent information |
| `/download` | Store destinations and availability information |
| `/404.html` | Not-found page |

Public pages include metadata and canonical URLs for `https://bonusroundrewards.com`. Public content is indexable; `/partners` and the 404 page are excluded from the sitemap. Only the partner archive carries a `noindex` directive in the application package.

## Configuration and copy

`config/site.json` centralizes the operator, mailing address, contact emails, store URLs, and unresolved app-policy details. The chosen relationship is **“operated by Bonus Round Rewards LLC”**; the public site does not assert a parent-company or subsidiary relationship.

Replace the bracketed values using verified business decisions. Do not substitute assumed redemption times, supported countries, account-deletion menus, retention periods, point exchange rates, or response promises. Privacy and Terms are deliberately marked **DRAFT FOR ATTORNEY REVIEW**. Use `LAUNCH-CHECKLIST.md` to finish and approve these inputs.

Adding either store URL updates the corresponding buttons, download-page availability and relevant metadata when you rebuild. The other platform can remain marked coming soon. Confirm both URLs before a full launch. Set `legalApproved`, `operationsVerified`, `publicAssetsApproved`, and `contactInboxesVerified` only after the corresponding work is complete. Those flags do not erase draft text or replace unresolved decisions; edit and approve the content itself.

The five WebP app images were copied from the existing Bonus Round site. They are illustrative mockups and may contain sample brands, balances, and rewards. Confirm that the images represent the released app and that all displayed names/artwork may be used. No invented testimonials, public payout statistics, ratings, or player counts are needed for this site.

## Contact forms and cookie preferences

Forms prepare a draft in the visitor's email app. The visitor must send that email; the website does not transmit or store the form contents on a server and does not create support tickets. The visible email links provide a fallback. A working mail client and monitored destination inboxes are required.

Cookie/consent preferences are stored only in the visitor's browser. No optional analytics or marketing scripts are included. A browser preference does not submit an account-level privacy request, remove app data, or change mobile SDK settings. The deletion and privacy pages direct those requests to the appropriate operational channels.

## Deploy on Vercel

Import the package root into the intended Vercel project, with `vercel.json` included. The configuration uses no framework, outputs `site/`, enables clean URLs, and removes trailing slashes. Build with `npm run build`. The shipped `site/` directory can also be served by another static host, but that host must implement equivalent clean routes, redirects, headers, and real 404 responses.

Publish a preview first, complete the launch checklist, and then deploy to the intended production project. Keep the current deployment available for rollback. DNS and email records are not changed by this package.

Always run the local build and commit the generated `site/` files **and `vercel.json` together** before pushing. The build includes explicit Content Security Policy hashes for JSON-LD and the preserved inline partner scripts; Vercel reads configuration before its remote build begins. A remote build alone cannot update the configuration already selected for that deployment. The delivered files and hashes are synchronized.

## Preserved partnership proposal

| Existing route | Preserved destination |
| --- | --- |
| Existing proposal homepage | `/partners` |
| `/economics-model` | `/partners/economics-model` |
| `/install-model` | `/partners/install-model` |

The original static proposal, CSS, assets, and interactive model scripts were retained. Same-site navigation was rebased to `/partners`. `partner-migration-report.json` records the original source URLs, file hashes, and preservation checks.

Keep these pages out of public navigation and the sitemap. Their `noindex,nofollow` directives require crawler access; do not block the archive in `robots.txt`. Unlisted and `noindex` pages are still publicly accessible to anyone with their URLs. The generated Content Security Policy explicitly permits the preserved scripts by hash. Test both model sliders and the transfer of install assumptions into the economics model after deployment.
