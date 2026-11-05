/* No trackers, dependencies, form endpoints, or third-party requests. */
(() => {
  'use strict';
  const root = document.documentElement;
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-navigation');
  if (menu && nav) {
    menu.hidden = false;
    root.classList.add('js-enabled');
    const closeMenu = () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); }
    });
  }

  const storageKey = 'bonusround_privacy_v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const banner = document.querySelector('#cookie-banner');
  const dialog = document.querySelector('#cookie-dialog');
  const analytics = document.querySelector('#consent-analytics');
  const marketing = document.querySelector('#consent-marketing');
  const status = document.querySelector('#site-status');
  const gpc = navigator.globalPrivacyControl === true;
  let opener = null;
  let remembered = false;
  let consent = { version: 1, essential: true, analytics: false, marketing: false, savedAt: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && saved.version === 1 && typeof saved.analytics === 'boolean' && typeof saved.marketing === 'boolean' && Number.isFinite(saved.savedAt) && saved.savedAt <= Date.now() && Date.now() - saved.savedAt < lifetime) {
      consent = { version: 1, essential: true, analytics: saved.analytics, marketing: saved.marketing, savedAt: saved.savedAt };
      remembered = true;
    }
  } catch { /* A blocked storage API must never prevent the site from working. */ }
  if (gpc) {
    consent.analytics = false; consent.marketing = false;
    // A prior opt-in must not silently return after a later visit without GPC.
    if (remembered) {
      consent.savedAt = Date.now();
      try { localStorage.setItem(storageKey, JSON.stringify(consent)); } catch { /* Session choice remains all-off. */ }
    }
  }

  const announce = text => { if (status) status.textContent = text; };
  const closeDialog = () => {
    if (dialog?.open) dialog.close();
    document.body.classList.remove('dialog-open');
  };
  const syncControls = () => {
    if (analytics) { analytics.checked = consent.analytics; analytics.disabled = gpc; }
    if (marketing) { marketing.checked = consent.marketing; marketing.disabled = gpc; }
    document.querySelectorAll('.gpc-notice').forEach(el => { el.hidden = !gpc; });
    document.querySelectorAll('[data-consent="all"]').forEach(el => { el.hidden = gpc; });
    document.querySelectorAll('[data-privacy-status]').forEach(el => {
      el.textContent = gpc
        ? 'Global Privacy Control is detected. Optional website cookies are off for this browser. This does not identify or change your app account.'
        : 'Optional website cookies are ' + ((consent.analytics || consent.marketing) ? 'allowed by your saved browser preference. No optional services are installed.' : 'off for this browser. No optional services are installed.');
    });
  };
  const saveConsent = (allowAnalytics, allowMarketing) => {
    consent = { version: 1, essential: true, analytics: !gpc && Boolean(allowAnalytics), marketing: !gpc && Boolean(allowMarketing), savedAt: Date.now() };
    let persisted = true;
    try { localStorage.setItem(storageKey, JSON.stringify(consent)); } catch { persisted = false; }
    if (banner) banner.hidden = true;
    closeDialog();
    syncControls();
    window.dispatchEvent(new CustomEvent('bonusround:consentchange', { detail: { ...consent, globalPrivacyControl: gpc } }));
    announce(persisted ? 'Your privacy choices were saved for this browser.' : 'Your privacy choices apply to this visit. Your browser prevented saving them.');
  };
  document.querySelectorAll('.cookie-settings').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      if (!dialog || typeof dialog.showModal !== 'function') { window.location.assign('/cookies'); return; }
      opener = button;
      syncControls();
      dialog.showModal();
      document.body.classList.add('dialog-open');
    });
  });
  document.querySelectorAll('[data-consent]').forEach(button => button.addEventListener('click', () => {
    const allow = button.dataset.consent === 'all';
    saveConsent(allow, allow);
  }));
  document.querySelector('#save-cookie-preferences')?.addEventListener('click', () => saveConsent(analytics?.checked, marketing?.checked));
  document.querySelector('[data-close-dialog]')?.addEventListener('click', closeDialog);
  dialog?.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (opener?.isConnected && opener.getClientRects().length) opener.focus();
    else document.querySelector('.site-footer .cookie-settings')?.focus();
  });
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog();
    }
  });
  syncControls();
  if (banner) banner.hidden = remembered;
  /* Future integrations must check this API before loading, and stop on withdrawal.
     A saved choice does not itself load or authorize any new third-party service. */
  window.BonusRoundPrivacy = Object.freeze({
    getConsent: () => ({ ...consent, globalPrivacyControl: gpc }),
    isAllowed: category => category === 'essential' || (['analytics', 'marketing'].includes(category) && consent[category] && !gpc)
  });

  document.querySelectorAll('[data-email-form]').forEach(form => {
    const prepare = form.querySelector('[data-prepare-email]');
    if (prepare) prepare.hidden = false;
    const params = new URLSearchParams(window.location.search);
    const topicSelect = form.querySelector('select[name="topic"]');
    if (topicSelect && Array.from(topicSelect.options).some(option => option.value === params.get('topic'))) topicSelect.value = params.get('topic');
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const fields = new FormData(form);
      const privacy = form.dataset.emailForm === 'privacy';
      const recipient = form.dataset.recipient;
      const topic = String(fields.get('topic') || (privacy ? 'Do not sell or share my personal information' : 'Support request'));
      const lines = [
        privacy ? 'Privacy request: ' + topic : 'Support topic: ' + topic,
        'Name: ' + String(fields.get('name') || '(not provided)'),
        'Reply email: ' + String(fields.get('email') || '(please use my sending address)'),
        'App account identifier: ' + String(fields.get('account') || '(not provided)'),
        '', String(fields.get('message') || ''), '',
        privacy ? 'Please apply this request to personal information associated with the identifiers I supplied, as applicable.' : 'Sent using the Bonus Round website email-draft helper.'
      ];
      const subject = 'Bonus Round — ' + topic;
      const body = lines.join('\n');
      const draft = form.querySelector('[data-email-preview]');
      const text = form.querySelector('[data-email-text]');
      const link = form.querySelector('[data-email-link]');
      const result = form.querySelector('[data-email-status]');
      if (text) text.value = 'To: ' + recipient + '\nSubject: ' + subject + '\n\n' + body;
      if (link) link.href = 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (draft) draft.hidden = false;
      if (result) { result.textContent = 'Your email draft is ready. Open your email app and send it to complete your request. Nothing has been sent by this website.'; result.hidden = false; }
      link?.focus();
    });
    form.querySelector('[data-copy-email]')?.addEventListener('click', async () => {
      const text = form.querySelector('[data-email-text]');
      const result = form.querySelector('[data-email-status]');
      if (!text) return;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(text.value);
        if (result) result.textContent = 'Email text copied. Paste it into your email app and send it. Nothing has been sent by this website.';
      } catch {
        text.focus(); text.select();
        if (result) result.textContent = 'Select and copy the email text below, then paste it into your email app and send it.';
      }
    });
  });
})();
