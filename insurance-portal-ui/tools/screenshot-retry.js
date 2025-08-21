const http = require("http");
const child = require("child_process");
const url = process.argv[2] || "http://localhost:42700/demo";
const out = process.argv[3] || "public/assets/demo/demo-screenshot-live.png";

function check(next) {
  const req = http.get(url, (res) => {
    next(null, res.statusCode);
  });
  req.on("error", (err) => next(err));
  req.setTimeout(2000, () => req.destroy(new Error("timeout")));
}

let attempts = 0;
function waitAndRun() {
  attempts++;
  if (attempts > 12) {
    console.error("Server did not become available after retries");
    process.exit(2);
  }
  console.log("Checking", url, "attempt", attempts);
  check((err, code) => {
    if (!err && code && code >= 200 && code < 500) {
      console.log("Server responsive (", code, "), running screenshot");
      const proc = child.spawn("node", ["tools/demo-screenshot.js", url, out], {
        stdio: "inherit",
      });
      proc.on("exit", (code) => process.exit(code));
    } else {
      console.log("Not ready yet:", err ? err.message : "status=" + code);
      setTimeout(waitAndRun, 1000);
    }
  });
}

waitAndRun();
