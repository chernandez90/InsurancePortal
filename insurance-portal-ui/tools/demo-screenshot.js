const puppeteer = require("puppeteer");
const fs = require("fs");
(async () => {
  const url = process.argv[2] || "http://localhost:4200/demo";
  const out = process.argv[3] || "public/assets/demo/demo-screenshot.png";
  console.log(`Opening ${url} and saving screenshot to ${out}`);
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.screenshot({ path: out, fullPage: false });
  await browser.close();
  console.log("Done.");
})();
