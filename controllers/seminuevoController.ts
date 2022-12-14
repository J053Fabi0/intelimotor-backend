import { join } from "path";
import sleep from "../utils/sleep";
import puppeteer, { Page } from "puppeteer";
import handleError from "../utils/handleError";
import { screenshotsDir } from "../utils/constants";
import CommonResponse from "../types/commonResponse.type";
import PostSeminuevo from "../types/api/seminuevo/postSeminuevo.type";
import isRoot from "../utils/isRoot";
import repeatUntilNoError from "../utils/repeatUntilNoError";

async function login(page: Page) {
  await page.goto("https://www.seminuevos.com/login");

  // type email
  await page.type("#email_login", process.env.USERNAME as string);

  // type password
  await page.type("#password_login", process.env.PASSWORD as string);

  // submit form
  await page.click("button.input__submit:nth-child(3)");
  await page.waitForNavigation();
}

async function sellCar(page: Page, price: number, description: string) {
  async function setField({
    selector,
    dropdownID,
    dropdown,
  }: {
    selector: string;
    dropdownID: string;
    dropdown: string;
  }) {
    let n = 0;
    const reportarFalla = async (paso: string) => {
      n++;
      // console.log(`Intento #${n} fallido. Paso: ${paso}. DropdownID: ${dropdownID}. Selector: "${selector}\n`);
      await sleep(10);
    };

    while (true) {
      if (n >= 100) throw new Error();

      try {
        await page.click(selector);
      } catch (_) {
        reportarFalla("Click selector");
        continue;
      }

      try {
        await page.keyboard.type(dropdown);
      } catch (_) {
        reportarFalla("Escribir");
        continue;
      }

      try {
        await page.click(`#dropdown_${dropdownID} > div > div > ul > li:nth-child(1) > a`);
        break;
      } catch (_) {
        reportarFalla("Click dropdown");
      }
    }
  }

  await page.goto("https://www.seminuevos.com/wizard");

  const selector = (nthChild: number) =>
    `#wizard > div > div > div.wizard-content > div > div > div > div:nth-child(1) > ` +
    `div.card-content > div > div:nth-child(${nthChild}) > div > a`;
  const fields = [
    { selector: selector(2), dropdownID: "brands", dropdown: "acura" },
    { selector: selector(3), dropdownID: "models", dropdown: "ilx" },
    { selector: selector(4), dropdownID: "subtypes", dropdown: "sed" },
    { selector: selector(5), dropdownID: "years", dropdown: "2018" },
    { selector: selector(6), dropdownID: "provinces", dropdown: "nuevo" },
    { selector: selector(7), dropdownID: "cities", dropdown: "monterrey" },
  ];
  const maxTries = 2;
  for (let i = 1; i <= maxTries; i++) {
    for (const field of fields)
      try {
        await setField(field);
      } catch (e) {
        if (i === maxTries) throw e;
        else continue; // No dejar que llegue al break, y volver a intentar desde el inicio.
      }
    break; // Si consigue realizar el for-of anterior, salir del for actual.
  }

  // El kilometraje
  await page.type("#input_recorrido", "20000");

  // Poner el precio
  await page.type("#input_precio", price.toString());

  // Siguiente
  await page.click("#wizard > div > div > div.footer-fixed > div > div.footer-button.footer-column > button");

  // La descripci??n
  await page.waitForSelector("#input_text_area_review");
  await page.type("#input_text_area_review", description);

  // Las fotos
  // @ts-ignore
  await (await page.$("#Uploader")).uploadFile("./images/1.png", "./images/2.png", "./images/3.png");

  // Wait for the page to stop loading to click next
  await page.waitForSelector("#wizard > div > div > div.transition-opacity.loading-area", { hidden: true });

  // Siguiente
  const nextSelector =
    "#wizard > div > div > div.footer-fixed > div > div.footer-button.footer-column > button:nth-child(2)";
  await page.waitForSelector(nextSelector);
  await page.click(nextSelector);

  // Wait for it to create the publication
  await page.waitForSelector("#wizard > div > div > div.transition-opacity.loading-area");
  await page.waitForSelector("#wizard > div > div > div.transition-opacity.loading-area", { hidden: true });
}

async function photographLatestPublication(page: Page) {
  await page.goto("https://www.seminuevos.com");

  // Go to pending vehicles
  await page.click("#login-bar > div > a");
  await page.waitForSelector("#userAccountNav > div.header-nav > div > div.test > a");
  await page.click("#userAccountNav > div.header-nav > div > div.test > a");
  await page.goto("https://www.seminuevos.com/my_vehicles/pending?dealer_id=0");

  // Get the vehicle's ID
  const productID = (
    await page.$eval("#main > div.row-fluid > div > div.search-results > ul > li:nth-child(2)", (e) => e.id)
  ).substring(16);

  // Go to the vehicle's webpage
  await page.goto(`https://www.seminuevos.com/myvehicle/${productID}`);

  await page.waitForSelector("#vehicle > div > div.loading-data.white.transition-opacity", { hidden: true });

  // Take the screenshot
  const ssName = Date.now().toString();
  await page.screenshot({ path: join(screenshotsDir, `${ssName}.png`) });

  return { ssName, productID };
}

export const postSeminuevo = async ({ body: { price, description } }: PostSeminuevo, res: CommonResponse) => {
  try {
    const browser = await puppeteer.launch({ headless: true, args: isRoot() ? ["--no-sandbox"] : undefined });

    const page = await browser.newPage();
    page.setDefaultTimeout(15 * 1_000); // Un timeout de 15 segundos en todo.
    page.setViewport({ width: 1300, height: 2000 });

    const maxTries = 4;

    // Login
    console.log("Haciendo login");
    await repeatUntilNoError(...([() => login(page), maxTries, 0] as const), (e, i) =>
      console.log(`Error en login en el intento #${i}:`, e)
    );

    // Publicar carro
    console.log("Publicando carro");
    await repeatUntilNoError(...([() => sellCar(page, price, description), maxTries, 0] as const), (e, i) =>
      console.log(`Error en sellCar en el intento #${i}:`, e)
    );

    // Tomar captura de pantalla
    console.log("Tomando captura de pantalla");
    const { ssName, productID } = await repeatUntilNoError(
      ...([() => photographLatestPublication(page), maxTries, 0] as const),
      (e, i) => console.log(`Error en photographLatestPublication en el intento #${i}:`, e)
    );

    await browser.close();

    console.log("Listo");

    res
      .status(200)
      .send({ ssName: `${ssName}.png`, publicationURL: `https://www.seminuevos.com/myvehicle/${productID}` });
  } catch (e) {
    handleError(res, e);
  }
};
