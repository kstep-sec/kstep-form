const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Go to local index.html
    await page.goto('file:///d:/Project/Antigravity/Survey2026Roadmap001/index.html');

    // Fill out some required fields
    await page.type('input[name="entry.1341068020"]', '표준 전문가 설문'); // This might not work actually since it's a radio...
    await page.evaluate(() => {
        document.querySelector('input[name="entry.1341068020"][value="표준 전문가 설문"]').checked = true;
        document.querySelector('textarea[name="entry.85574161"]').value = '테스트이유';
        document.querySelector('input[name="entry.361180820"]').value = '테스트표준';
        document.querySelector('textarea[name="entry.1175071977"]').value = '테스트상세';
        document.querySelector('select[name="entry.1386415443"]').value = '1. 제조업 전반';
        document.querySelector('select[name="entry.1381958828"]').value = 'A. Digital Twin';
        document.querySelector('input[name="entry.1761286863"][value="아니요"]').checked = true;
        document.querySelector('input[name="entry.681997926"][value="1. 국제표준(ISO, IEC, ...)"]').checked = true;
        document.querySelector('input[name="entry.1333260810"][value="동의"]').checked = true;
    });

    // Submit
    await page.evaluate(() => {
        document.getElementById('custom-form').dispatchEvent(new Event('submit', { cancelable: true }));
    });

    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
})();
