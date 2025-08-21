const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
  try {
    const svgPath =
      process.argv[2] ||
      path.join(
        __dirname,
        "..",
        "public",
        "assets",
        "demo",
        "demo-screenshot.svg"
      );
    const outPath =
      process.argv[3] ||
      path.join(
        __dirname,
        "..",
        "public",
        "assets",
        "demo",
        "demo-screenshot.png"
      );
    console.log("SVG -> PNG converter");
    console.log("Reading SVG:", svgPath);

    if (!fs.existsSync(svgPath)) {
      console.error("SVG file not found:", svgPath);
      process.exit(2);
    }

    const svg = fs.readFileSync(svgPath, "utf8");
    const dataUrl =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // set viewport similar to SVG viewbox
    await page.setViewport({ width: 1200, height: 700, deviceScaleFactor: 1 });
    await page.goto(dataUrl, { waitUntil: "networkidle0" });

    // give fonts/styles a brief moment
    await page.waitForTimeout(200);

    // create directory if needed
    const outDir = path.dirname(outPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    await page.screenshot({ path: outPath, omitBackground: false });
    await browser.close();
    console.log("Wrote PNG to", outPath);
  } catch (err) {
    console.error("Error converting SVG to PNG:", err);
    process.exit(1);
  }
})();
