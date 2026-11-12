# Bonus Round actual screenshot integration QA

Verified November 5, 2026. No production deployment was performed.

## Integration

All five owner-supplied images are now used in public pages:

- 27: edited Klondike level 12 home screen, homepage hero.
- 31: edited Klondike level 12 offer detail, homepage hero/gallery and How It Works.
- 29: edited RAID level 8 game list, homepage gallery and How It Works.
- 25: welcome overlay, homepage gallery.
- 33: original launch screen, About page.

App image files match the approved edited PNG files and original launch JPEG byte for byte. No further image edits, cropping or recompression were performed. Website styling displays full screenshots with their correct aspect ratio and removes the old added white frames and fixed-height clipping. Old consumer WebP mockups were removed; archived partner images remain unchanged.

## Validation

- Build passed; 13 public/error pages regenerated with updated Content Security Policy hashes.
- 2,592 structural checks passed across 13 public/error pages and three archived pages.
- All five new assets are referenced in public pages and match their input files byte for byte.
- All partner archive files are byte-for-byte unchanged. Existing noindex and sitemap/navigation exclusions remain.
- No former-company reference, home address or personal phone in public HTML. No references to old consumer mockup files remain.
- Browser: homepage hero and all three gallery images loaded; desktop layout visually inspected at 1280 px. Homepage, How It Works and About had no horizontal overflow at 320 px. Screenshot saved with deliverables.

Existing launch blockers remain: legal drafts, unconfirmed operational policies, missing store listings, effective dates and approval flags. These were not approved by this image update. Test-build image captions explain that displayed offers, values, timers and activity counts are examples. The existing actual gift-card artwork and company contact cleanup remain in place.

## Image disclaimer update

Added the owner-requested wording below homepage screenshots, gift-card artwork and each How It Works screenshot. Additional text covers illustrative previews, changing offer amounts/requirements/availability, and checking current in-app eligibility, deadlines and redemption terms. Rebuilt successfully and passed all 2,592 structural checks. Image assets and partner archive were not changed.

## Campaign placement correction — November 12, 2026

Homepage main content verified unchanged. Added only a small bottom footer link to `/qr-test`. The grid has noindex metadata/header and is absent from the sitemap. Five landing routes and all verified QR exports are integrated separately. Build and 2,959 static checks passed. No deployment performed.
