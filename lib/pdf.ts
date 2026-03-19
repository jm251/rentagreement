import "server-only";

import chromium from "@sparticuz/chromium";
import puppeteer, { type Page } from "puppeteer-core";

async function withAgreementPage<T>(
  html: string,
  callback: (page: Page) => Promise<T>,
) {
  chromium.setGraphicsMode = false;

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 2,
    });
    await page.setContent(html, { waitUntil: "networkidle0" });
    return await callback(page);
  } finally {
    await browser.close();
  }
}

export async function renderPdfBufferFromHtml(html: string) {
  return withAgreementPage(html, async (page) =>
    Buffer.from(
      await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "90px",
          right: "36px",
          bottom: "80px",
          left: "36px",
        },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 0;"></div>',
        footerTemplate: `
          <div style="width: 100%; font-size: 10px; color: #6a5948; padding: 0 24px 10px; display: flex; justify-content: space-between;">
            <span>Generated via Rent Agreement Generator India | This is a computer-generated document</span>
            <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
          </div>
        `,
      }),
    ),
  );
}

export async function renderImageBufferFromHtml(html: string) {
  return withAgreementPage(html, async (page) =>
    Buffer.from(
      await page.screenshot({
        type: "png",
        fullPage: true,
      }),
    ),
  );
}
