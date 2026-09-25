# Publishing the Bonus Round proposal site — no GitHub experience required

This walks through publishing this site from its files: `index.html`,
`economics-model.html`, `install-model.html`, `styles.css`, `vercel.json`,
and the `assets/` folder (the five real app-screen creatives + favicon).
It creates a fresh GitHub repo under your own account — a dedicated repo
for Bonus Round, separate from any other proposal site — so nobody needs
write access to an existing repo, and no AI assistant needs GitHub push
permissions either.

## 1. Create a new, empty GitHub repository

1. Go to [github.com/new](https://github.com/new) (sign in first if needed).
2. **Repository name**: something like `bonus-round-proposal` (lowercase,
   hyphens instead of spaces).
3. Set it to **Private**.
4. Leave "Add a README file" unchecked.
5. Click **Create repository**.

## 2. Upload the files

1. On the new repo's page, click **uploading an existing file** (or
   **Add file → Upload files**).
2. Drag `index.html`, `economics-model.html`, `install-model.html`,
   `styles.css`, `vercel.json`, and the whole `assets` folder onto the
   upload box together. They should land at the repo's root, with `assets`
   as a subfolder (GitHub preserves folder structure when you drag a
   folder in).
3. Commit with a message like `Initial Bonus Round proposal site`.

## 3. Connect the repo to Vercel

1. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub if
   needed, and **Import** the repo you just created.
2. Leave the build settings on their defaults — this is a static site,
   no build command needed.
3. Click **Deploy**. You'll get a live URL like
   `https://bonus-round-proposal.vercel.app` within a minute.
4. Click through all three pages (home, Economics Model, Install Model)
   and try the phone-screen gallery on the home page to confirm the
   creatives load and the lightbox works.

## 4. (Optional) Point bonusroundrewards.com at it

In the Vercel project, go to **Settings → Domains**, add the domain, and
follow the DNS instructions Vercel shows. Domain registration alone does
not publish this site — DNS has to point at this Vercel project first.

## 5. Making changes later

Edit the file directly in GitHub (pencil icon → edit → commit) and Vercel
redeploys automatically. If an AI assistant makes the edit for you, hand
back the finished file and re-upload it the same way as step 2 — that's
the only step it can't do without repo access, and this workflow means it
never needs it.

## Data and assumptions used in this build

- **Audience**: Scrabble (50 episodes, 422,000 average viewers) and
  Trivial Pursuit (50 episodes, 505,000 average viewers), both supplied by
  the client via the BGE sheet. Combined, that's 46,350,000 annual viewer
  exposures — exposures, not unique viewers.
- **CW social**: Facebook 2,200,000, Instagram 1,700,000, TikTok
  1,100,000, YouTube 1,850,000, X 958,100 — summing to 7,808,100. These
  are the same shared CW network accounts counted once across both shows,
  not unique people.
- **Response assumptions** (adjustable in the Install Model): the
  documented baseline is 0.5% viewer-to-scan, 10% scan-to-install, 52
  promotional waves/year, 3% reach/account/wave, 1% click-through, 20%
  store conversion, with 10% of combined installs excluded as likely
  duplicates — that baseline nets to about 42,783 annual installs. Both
  model pages load with a modestly optimistic case instead (0.55%
  viewer-to-scan, 1.1% click-through, everything else at baseline), which
  nets to about 47,061 annual installs (+10%); each slider's delta vs. the
  documented baseline is shown live on the page.
- **Economics assumptions** (adjustable in the Economics Model): documented
  baseline is 45% engaged-install rate, 15% monthly churn, $5.50 gross
  revenue and $2.00–$2.25 partner share per active player per month. The
  page loads with a modestly optimistic case instead (46% engaged-install
  rate, 14% monthly churn, $2.05–$2.30 partner share), which combined with
  the modest install lift above puts steady-state active players at about
  12,900 and modeled annual partner share at $317K–$356K.
- **Company proof points**: $250M+ lifetime revenue, $50M+ rewards paid to
  players — supplied by Influence Mobile.

The homepage's Economics section (chapter 10) is transcribed directly from
the Economics Model's own default-scenario output, so the two pages always
agree — it is not a separate round-number illustration.
