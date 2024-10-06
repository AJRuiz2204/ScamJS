import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
    const browser = await chromium.launch({ headless: true }); // Ejecutar en modo headless
    const page = await browser.newPage();
    await page.goto('https://www.superselectos.com/');

    // Esperar a que los productos se carguen en la página
    await page.waitForSelector('.prod-box-inner');

    const products = await page.$$eval('.prod-box-inner', (results) =>
        results.map((el) => {
            const titleElement = el.querySelector('.prod-nombre');
            const priceElement = el.querySelector('.precio');
            const imageElement = el.querySelector('.prod-images img');

            const title = titleElement ? titleElement.innerText.trim() : null;
            const price = priceElement ? priceElement.innerText.trim() : null;
            const image = imageElement ? imageElement.getAttribute('src') : null;

            if (!title || !price || !image) return null;

            return {
                title,
                price,
                image,
            };
        }).filter(product => product !== null)
    );

    // Exportar el resultado a un archivo .json
    fs.writeFileSync('products.json', JSON.stringify(products, null, 2), 'utf-8');
    console.log('Archivo JSON creado: products.json');

    await browser.close();
})();
