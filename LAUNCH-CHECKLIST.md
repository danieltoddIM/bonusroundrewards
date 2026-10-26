# Bonus Round launch checklist

Prepared October 26, 2026. Use this checklist before replacing the current production site or submitting website URLs to the app stores. The delivered package does not deploy itself or configure DNS, email, app account deletion, or rewards fulfillment.

## 1. Complete the company and app facts

- [ ] Confirm the exact registered legal name `[Bonus Round Rewards LLC]` and its Arizona limited liability company status. Replace the placeholder mailing address `[street, city, AZ ZIP]` everywhere it appears.
- [ ] Confirm the chosen public relationship: **operated by Bonus Round Rewards LLC**. Do not substitute a subsidiary or technology affiliation without approval.
- [ ] Confirm `support@bonusroundrewards.com` and `privacy@bonusroundrewards.com` are the correct monitored addresses. Omit the optional telephone field unless a real public number is supplied.
- [ ] Replace the App Store and Google Play placeholders with the exact live Bonus Round listings. Confirm the app name, operator, supported operating systems, and territory availability agree with each listing.
- [ ] Confirm supported countries, age requirement of 18+, account restrictions, qualifying gameplay, tracking prerequisites, and supported devices. Publish no inferred countries or device requirements.
- [ ] Set verified reward conversion values, minimum redemptions, limits, delivery timing, bonus/streak conditions, expiry rules if any, and fraud-review procedures. Keep sample screenshot values explicitly illustrative until replaced.
- [ ] Confirm the actual in-app deletion menu path, identity-verification method, completion timeline, retained data categories/purposes, and retention periods. Confirm what happens to unredeemed points and pending rewards.
- [ ] Confirm all SDKs, attribution/ad partners, fulfillment providers, data categories, transfers, retention practices, and privacy-request workflows against the released app. Do not let the website's lack of tracking stand in for the app's privacy disclosures.
- [ ] Replace placeholder gift card names only with verified available brands. Approve all screenshot, logo, badge, game artwork, and trademark use. Keep the gift card/Apple/Google non-sponsorship disclaimer.
- [ ] Search source and generated output for brackets, TODO/TBD text, sample URLs, unapproved claims, and draft markers. Remove each placeholder only after its value is approved; then rebuild.

## 2. Review and approve legal/operational text

- [ ] Have counsel review Privacy Policy and Terms, including CCPA/CPRA and other applicable state rights, international availability/transfers, data sharing, advertising identifiers, SDKs, retention, children's privacy, security language, Arizona governing law, and any arbitration/opt-out provision.
- [ ] Have counsel review Rewards Rules, account/data deletion disclosures, the Do Not Sell or Share page, cookie disclosures, fraud/VPN/emulator rules, and limits/exceptions. Confirm each statement matches actual practice.
- [ ] Set approved effective dates and remove **DRAFT FOR ATTORNEY REVIEW** only after review and business approval. Confirm the footer names the operator/address and reads `© 2026 [approved legal entity name]`.
- [ ] Assign owners for support, privacy requests, identity verification, required response deadlines, appeals where applicable, deletion, and third-party data deletion. Avoid publishing an unverified service-level promise.
- [ ] Implement and test the actual in-app account deletion capability. Apple's guidance requires in-app initiation and ordinarily does not permit mandatory email/customer-service completion; this website's email alternative is not a substitute. Google Play also requires an in-app path and an external web resource that lets users request deletion. See [Apple account deletion guidance](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion) and [Google Play account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).
- [ ] Test a real deletion through the in-app route and the external email route, verify the result in relevant systems, and confirm documented retained records and processor actions. Test an actual privacy opt-out end to end; a website cookie choice alone does not perform an account-level opt-out.

## 3. Configure Vercel and DNSimple

- [ ] Identify the intended existing Vercel project and retain its current production deployment/commit as a rollback point. Import this package at the repository root and check the deployed preview before production promotion.
- [ ] Confirm project configuration: no framework (`framework: null` / Other), build `npm run build`, output `site`, clean URLs enabled, trailing slashes disabled. Include the delivered redirects and security headers.
- [ ] Run the build locally and commit regenerated `site/` output and `vercel.json` together. Content Security Policy hashes are generated from the delivered inline scripts and JSON-LD; do not rely on the remote build to change configuration already read by Vercel.
- [ ] Add or confirm both `bonusroundrewards.com` and `www.bonusroundrewards.com` in that project's **Settings → Domains**. Use `https://bonusroundrewards.com` as the canonical origin and configure `www` to redirect there.
- [ ] In DNSimple, use the **exact current record values shown by that Vercel project**: the apex A record for the root hostname and CNAME for `www`, plus any requested domain-verification TXT record. Do not copy an IP address or CNAME from an old guide or another project. Resolve conflicting records only after checking their purpose.
- [ ] Keep existing DNSimple nameservers unless intentionally migrating DNS. Preserve MX, SPF, DKIM, DMARC, and unrelated verification records. Website routing does not require moving domain email.
- [ ] Wait for Vercel to report valid domain configuration and a valid HTTPS certificate. Test HTTP→HTTPS and `www`→apex redirects, including paths/query strings, without loops. Vercel's [domain setup documentation](https://vercel.com/docs/domains/working-with-domains/add-a-domain) explains project-specific records and verification.

## 4. Configure and test domain email

- [ ] Create or confirm working, monitored support and privacy inboxes (or routed aliases with working reply identities). Assign ownership and backup coverage.
- [ ] At DNSimple, publish the chosen email provider's exact MX records and priorities. Configure one SPF TXT policy covering authorized senders, provider-supplied DKIM records, and an appropriate DMARC policy/report destination. Do not invent record values. See [DNSimple email DNS guidance](https://support.dnsimple.com/articles/managing-email-dns-records/).
- [ ] Send messages from an external account to both addresses and reply from each branded address. Check delivery, spam placement, routing, and SPF/DKIM/DMARC results in received headers.
- [ ] Test every website email link/form on iOS, Android, and desktop. Confirm recipient, subject, and message formatting. Confirm the interface says it opens an email draft rather than claiming a request was submitted.
- [ ] Test the fallback with no default email application. Visible email addresses and instructions must still let visitors contact the team.

## 5. Verify the deployed site

- [ ] Run the package's build and check commands. Review every public page at small mobile, tablet, and desktop sizes; check keyboard access, focus visibility, skip link, mobile menu, accordion controls, form labels/errors, zoom, text contrast, reduced-motion preferences, and screen-reader basics. Automated checks alone do not certify WCAG AA.
- [ ] Run `npm run check:launch` and resolve every blocker. Set the four readiness flags in `config/site.json` only after the underlying legal, operations, artwork and inbox work is complete.
- [ ] Test both store destinations on appropriate devices. Verify the real app flow from installation through eligible gameplay, tracking, points, redemption, and gift card fulfillment before approving related marketing copy.
- [ ] Test consent choices, preference persistence, reopening settings, and unavailable browser storage. Confirm no optional analytics/marketing request fires before a choice—or afterward in this package, which includes no optional tracking scripts.
- [ ] Confirm support and privacy form text is not sent to the web server, put into website URLs, or stored as browser data. Requests exist operationally only after the visitor sends the generated email.
- [ ] Verify every public URL returns the intended page without sign-in, challenge, `noindex` meta tag, or `X-Robots-Tag: noindex`. Inspect canonical, Open Graph/Twitter images, favicon, Organization/MobileApplication data, `robots.txt`, and `sitemap.xml` on the production origin. Do not publish invented review or rating schema.
- [ ] Verify an unknown route returns the designed 404 page **with HTTP 404**, and that `/404.html` and all `/partners` routes are absent from the sitemap.
- [ ] Test the preserved proposal at `/partners`, both model pages, images, sliders, and cross-page scenario persistence. Confirm `/economics-model` and `/install-model` redirect to their `/partners` counterparts. Confirm partner pages have `noindex,nofollow` and remain crawlable so that directive can be read.
- [ ] Check that public navigation/footer do not expose the proposal. Remember that an unlisted/noindex URL is not access control.
- [ ] Verify production security headers, no console errors, no broken local assets, appropriate caching, and acceptable load performance on a mobile connection. Check all legal/footer links and the required non-sponsorship disclaimer on every public page.

## 6. Submit the website URLs

Use these exact destinations after the final content is live and accessible. The following are website URLs; they are not the App Store/Google Play download URLs to insert into the site.

| Listing or review purpose | URL |
| --- | --- |
| Marketing URL / developer website | `https://bonusroundrewards.com/` |
| Support URL | `https://bonusroundrewards.com/support` |
| Privacy Policy URL | `https://bonusroundrewards.com/privacy-policy` |
| Google Play account-deletion web resource | `https://bonusroundrewards.com/account-deletion` |
| Deletion instructions for app review/support | `https://bonusroundrewards.com/account-deletion` |
| Privacy choices URL, when applicable | `https://bonusroundrewards.com/do-not-sell` |
| Terms of Use, where requested | `https://bonusroundrewards.com/terms` |
| Rewards program terms, where requested | `https://bonusroundrewards.com/rewards-rules` |

- [ ] Enter the Privacy Policy URL and support/marketing fields in App Store Connect as applicable; verify the [Apple platform-version field definitions](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information) and [app privacy requirements](https://developer.apple.com/app-store/app-privacy-details/).
- [ ] Enter the Privacy Policy URL, developer contact information, website, and account-deletion web resource in the appropriate Play Console fields. Align the Data safety declaration with the actual app, SDKs, and approved policy. See [Google Play User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311).
- [ ] Check all submitted links in a signed-out browser on a mobile network. Supply app reviewers with accurate in-app deletion steps and any review access they need.
- [ ] Promote the approved deployment, recheck the production URLs and email routes, and keep the previous production version available for rollback. Submit the public sitemap to the chosen search-engine tools when ready.
