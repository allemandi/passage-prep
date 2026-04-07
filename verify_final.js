const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 1000 });

  try {
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

    // Screenshot search form with "Include Unapproved" button
    await page.screenshot({ path: '/home/jules/verification/search_form_labels.png' });

    // Click theme dropdown to see "Any theme"
    await page.click('button:has-text("All themes")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/home/jules/verification/theme_dropdown_labels.png' });

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
