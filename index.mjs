import { chromium } from "playwright";
import fs from "fs";
import path from "path";

(async () => {
  // Iniciar el navegador
  const browser = await chromium.launch({ headless: true }); // Ejecutar en modo headless
  const page = await browser.newPage();
  await page.goto("https://www.superselectos.com/");

  // Esperar a que los productos se carguen en la página
  await page.waitForSelector(".prod-box-inner");

  // Obtener la fecha y hora actual para el nombre del archivo
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // Formato compatible con nombres de archivo

  // Extraer los datos de los productos
  const products = await page.$$eval(
    ".prod-box-inner",
    (results) =>
      results
        .map((el) => {
          const titleElement = el.querySelector(".prod-nombre");
          const priceElement = el.querySelector(".precio");
          const oldPriceElement = el.querySelector(".antes"); // Precio anterior (si existe)
          const savingsElement = el.querySelector(".ahorro"); // Ahorro (si existe)
          const imageElement = el.querySelector(".prod-images img");
          const categoryElement = el.closest(".cat"); // Categoría (si está disponible)

          const title = titleElement ? titleElement.innerText.trim() : null;
          const price = priceElement ? priceElement.innerText.trim() : null;
          const oldPrice = oldPriceElement
            ? oldPriceElement.innerText.trim()
            : null;
          const savings = savingsElement
            ? savingsElement.innerText.trim()
            : null;
          const image = imageElement ? imageElement.getAttribute("src") : null;
          const category = categoryElement
            ? categoryElement.innerText.trim()
            : null;

          if (!title || !price || !image) return null; // Filtrar productos incompletos

          return {
            title,
            price,
            oldPrice,
            savings,
            image,
            category,
          };
        })
        .filter((product) => product !== null) // Eliminar productos nulos
  );

  // Crear un objeto JSON con metadatos y los productos
  const dataToSave = {
    metadata: {
      extractedAt: new Date().toISOString(),
      source: "https://www.superselectos.com/",
    },
    products,
  };

  // Guardar los datos en un archivo JSON con la fecha y hora en el nombre
  const fileName = `products-${timestamp}.json`;
  const filePath = path.join(process.cwd(), fileName);
  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf-8");

  console.log(`Archivo JSON creado: ${fileName}`);

  // Cerrar el navegador
  await browser.close();
})();
