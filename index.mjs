import { chromium } from 'playwright';

const browser = await chromium.launch(
    { headless: true }
);

const page = await browser.newPage();

await page.goto('https://www.superselectos.com/');

const products = await page.$$eval (
    'prod-box-inner',
    (results) => 
        results.map((el) => {
            const title = el.querySelector('prod-nombre')?.innerText;
            const price = el.querySelector('precio')?.innerText;

            if (!title || !price) return null;

            const image = el.querySelector('prod-images').getAttribute('src');

            return {
                title,
                price,
                image
            };
        })
);

console.log(products);
await browser.close();