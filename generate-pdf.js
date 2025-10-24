const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const filePath = path.join(__dirname, 'qanda.html');
  await page.goto(`file://${filePath}`);
  await page.pdf({ path: 'qanda.pdf', format: 'A4', printBackground: true });
  await browser.close();
  console.log('PDF generated: qanda.pdf');
})();
