const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const OUT_DIR = path.resolve(__dirname, "../../assets/screenshots");

const MOCK_WALLET = {
  isConnected: async () => ({ isConnected: true }),
  requestAccess: async () => ({
    address: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
  }),
  signTransaction: async (txXdr) => ({ signedTxXdr: txXdr }),
};

async function ensureDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function captureAuth() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1728, height: 1117 },
  });

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: path.join(OUT_DIR, "01-auth-screen.png"),
    fullPage: true,
  });

  await browser.close();
}

async function captureDashboardTabs() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1728, height: 1117 },
  });

  await context.addInitScript((wallet) => {
    window.freighterApi = wallet;
  }, MOCK_WALLET);

  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  await page.waitForTimeout(2500);

  const captures = [
    { tab: "Seller Dashboard", file: "02-seller-dashboard.png" },
    { tab: "Marketplace", file: "03-marketplace.png" },
    { tab: "Escrow Status", file: "04-escrow-status.png" },
    { tab: "History", file: "05-history.png" },
    { tab: "Settings", file: "06-settings.png" },
  ];

  for (const item of captures) {
    await page.getByRole("tab", { name: item.tab }).click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(OUT_DIR, item.file),
      fullPage: true,
    });
  }

  await browser.close();
}

(async () => {
  await ensureDir();
  await captureAuth();
  await captureDashboardTabs();
  console.log(`Screenshots saved to ${OUT_DIR}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
