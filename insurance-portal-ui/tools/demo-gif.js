const puppeteer = require("puppeteer");
const GIFEncoder = require("gifencoder");
const { createCanvas } = require("canvas");
const fs = require("fs");
(async () => {
  const url = process.argv[2] || "http://localhost:4200/demo";
  const out = process.argv[3] || "public/assets/demo/demo.gif";
  console.log(`Opening ${url} and recording to ${out}`);
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const width = 1000;
  const height = 700;
  await page.setViewport({ width, height });
  await page.goto(url, { waitUntil: "networkidle2" });

  const encoder = new GIFEncoder(width, height);
  const stream = encoder.createWriteStream({
    repeat: 0,
    delay: 500,
    quality: 10,
  });
  const outStream = fs.createWriteStream(out);
  stream.pipe(outStream);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(700);
  encoder.setQuality(10);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  for (let i = 0; i < 6; i++) {
    // for demo, click around or wait
    await page.waitForTimeout(600);
    const screenshot = await page.screenshot({ encoding: "binary" });
    const img = new Image();
    // Use canvas to draw — but node-canvas Image isn't globally available; instead draw via buffer
    const imgBuf = screenshot;
    const png = require("png-js");
    // fallback: write frames directly by decoding screenshot via canvas loadImage
    const { loadImage } = require("canvas");
    const image = await loadImage(imgBuf);
    ctx.drawImage(image, 0, 0, width, height);
    encoder.addFrame(ctx);
    // optionally click a CTA to simulate flow
    if (i === 1) await page.click(".card .btn");
    if (i === 3) await page.click(".card .btn-outline");
  }

  encoder.finish();
  outStream.on("close", async () => {
    await browser.close();
    console.log("GIF written to", out);
  });
})();
