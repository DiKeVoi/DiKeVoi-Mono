/**
 * E2E: full ride lifecycle with two accounts
 *
 * Flow:
 *   A (offerer) creates an offer post
 *   B (requester) browses → connects to A's post (creates negotiation)
 *   A accepts the negotiation → ride confirmed
 *   A starts the ride
 *   A confirms finish → B confirms finish → awaiting_payment
 *   A confirms received → B confirms paid → completed
 *
 * Auth: injects Supabase session directly (bypasses OTP).
 * Fill in ACCOUNT_A / ACCOUNT_B with real test-account credentials.
 */

import { test, expect, chromium, BrowserContext, Page } from "@playwright/test";
import jwt from "jsonwebtoken";

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:8081";
const SUPABASE_URL = "https://gtclxnnztgbakqvtfzaf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_d9MoBH50QicCHucZHhjP0w_L4WA9S7s";

// Matches backend settings: jwt_secret / jwt_algorithm / jwt_expire_minutes
const JWT_SECRET = "change-me-in-production";
const JWT_ALGORITHM = "HS256";
// Key used by tokenStorage.ts on web (AsyncStorage → localStorage)
const TOKEN_STORAGE_KEY = "dikevoi_jwt";

const ACCOUNT_A = { email: "offerer@test.edu.com" };
const ACCOUNT_B = { email: "requester@test.edu.com" };

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fetch user ID from public.User table by email */
async function getUserId(email: string): Promise<string> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/User?email=eq.${email}&select=id&limit=1`,
    { headers: { apikey: SUPABASE_ANON_KEY, Accept: "application/json" } }
  );
  const rows: { id: string }[] = await res.json();
  if (!rows.length) throw new Error(`User not found: ${email}`);
  return rows[0].id;
}

/** Generate a backend-compatible JWT for a user */
function createToken(userId: string, email: string): string {
  // Backend deps.py does json.loads(payload["sub"]), expecting { user_id, email }
  return jwt.sign(
    { sub: JSON.stringify({ user_id: userId, email }) },
    JWT_SECRET,
    { algorithm: JWT_ALGORITHM as jwt.Algorithm, expiresIn: "24h" }
  );
}

/** Inject JWT into localStorage and navigate directly to home screen */
async function injectSession(page: Page, token: string) {
  // addInitScript runs before any page JS on every navigation — the token is
  // already in localStorage when AuthContext calls getToken(), so it never
  // races against the page load or gets cleared by a failed getMe() retry.
  await page.addInitScript(
    ({ key, val }) => { localStorage.setItem(key, val); },
    { key: TOKEN_STORAGE_KEY, val: token }
  );
  await page.goto(`${BASE_URL}/home`);
  // "Đi ké với!" is the unconditional app header — confirms home screen rendered
  await expect(page.getByText("Đi ké với!", { exact: false }).first()).toBeVisible({ timeout: 15_000 });
}

async function click(page: Page, text: string, options?: { timeout?: number }) {
  await page.getByText(text, { exact: false }).first().click(options);
}

async function waitForText(page: Page, text: string, timeout = 20_000) {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible({ timeout });
}

/**
 * Select a location via LocationPicker modal.
 * @param fieldPlaceholder - visible placeholder text on the collapsed field button
 * @param searchTerm       - text to type into the modal search box
 * @param resultText       - substring of the preset location name to click
 */
async function selectLocation(
  page: Page,
  fieldPlaceholder: string,
  searchTerm: string,
  resultText: string
) {
  // Tap the field button to open the modal
  await page.getByText(fieldPlaceholder, { exact: false }).first().click();
  // Wait for modal search input
  await expect(page.getByPlaceholder("Tìm kiếm...").first()).toBeVisible({ timeout: 5_000 });
  // Search and pick first matching result
  await page.getByPlaceholder("Tìm kiếm...").first().fill(searchTerm);
  await page.getByText(resultText, { exact: false }).first().click();
}

// ─── Test ─────────────────────────────────────────────────────────────────────

test("full ride lifecycle: post → connect → negotiate → start → finish → pay", async () => {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: false,
  });

  // Two isolated contexts = two separate logged-in sessions
  const ctxA: BrowserContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const ctxB: BrowserContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  // ── Login both accounts ──────────────────────────────────────────────────
  console.log("Logging in both accounts…");
  const [idA, idB] = await Promise.all([
    getUserId(ACCOUNT_A.email),
    getUserId(ACCOUNT_B.email),
  ]);
  const [tokenA, tokenB] = [
    createToken(idA, ACCOUNT_A.email),
    createToken(idB, ACCOUNT_B.email),
  ];
  await Promise.all([
    injectSession(pageA, tokenA),
    injectSession(pageB, tokenB),
  ]);

  // ── A: Create offer post ─────────────────────────────────────────────────
  console.log("A: creating offer post…");
  await pageA.goto(`${BASE_URL}/matching/request?role=driver`);
  await waitForText(pageA, "Cho đi ké");

  // Select "Cho đi ké" role if not pre-selected
  const driverTab = pageA.getByText("Cho đi ké", { exact: false }).first();
  if (await driverTab.isVisible()) await driverTab.click();

  // Pick pickup location from preset modal
  await selectLocation(pageA, "Chọn điểm khởi hành", "KTX", "KTX Khu B");

  // Pick destination from preset modal
  await selectLocation(pageA, "Chọn điểm đến", "Bách Khoa", "Trường Đại học Bách Khoa");

  // Submit
  await click(pageA, "Tạo bài đăng");
  await pageA.waitForTimeout(2000);
  console.log("A: offer post created ✓");

  // ── B: Browse and connect to A's post ───────────────────────────────────
  console.log("B: browsing for A's post…");
  await pageB.goto(`${BASE_URL}/(matching)/browse`);
  await waitForText(pageB, "Tìm bạn đồng hành");

  // Find offer card and click connect
  await pageB.waitForTimeout(2000);
  const connectBtn = pageB.getByText("Kết nối", { exact: false }).first();
  await expect(connectBtn).toBeVisible({ timeout: 15_000 });
  await connectBtn.click();
  console.log("B: negotiation created ✓");

  // ── B navigates to negotiation chat ─────────────────────────────────────
  // After connect, should navigate to chat or show a toast
  await pageB.waitForTimeout(2000);

  // ── A: Accept the negotiation ────────────────────────────────────────────
  console.log("A: looking for pending negotiation…");
  await pageA.goto(`${BASE_URL}/(matching)/negotiations`);
  await waitForText(pageA, "Yêu cầu kết nối");
  await pageA.waitForTimeout(2000);

  // A goes to connection-request screen via notification or negotiate list
  const viewBtn = pageA.getByText("Xem", { exact: false }).first();
  if (await viewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await viewBtn.click();
  }

  // Confirm / accept negotiation
  const acceptBtn = pageA.getByText("Chấp nhận", { exact: false }).first();
  if (await acceptBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await acceptBtn.click();
    await pageA.waitForTimeout(1000);
  }

  // Both confirm (if dual-confirm required)
  const confirmA = pageA.getByText("Xác nhận", { exact: false }).first();
  if (await confirmA.isVisible({ timeout: 5000 }).catch(() => false)) {
    await confirmA.click();
    await pageA.waitForTimeout(500);
  }
  const confirmB = pageB.getByText("Xác nhận", { exact: false }).first();
  if (await confirmB.isVisible({ timeout: 5000 }).catch(() => false)) {
    await confirmB.click();
  }
  console.log("Negotiation accepted/confirmed ✓");

  // ── A: Navigate to active rides and start ride ───────────────────────────
  console.log("A: starting ride…");
  await pageA.goto(`${BASE_URL}/(matching)/active-rides`);
  await waitForText(pageA, "Chuyến đi của bạn");
  await pageA.waitForTimeout(2000);

  await click(pageA, "Bắt đầu chuyến đi");
  // Confirmation dialog
  await pageA.waitForTimeout(500);
  const dialogConfirm = pageA.getByText("Bắt đầu", { exact: true }).last();
  if (await dialogConfirm.isVisible({ timeout: 3000 }).catch(() => false)) {
    await dialogConfirm.click();
  }
  await waitForText(pageA, "Đang di chuyển", 15_000);
  console.log("Ride started ✓");

  // ── Both: Navigate to in-progress screen ────────────────────────────────
  await pageB.goto(`${BASE_URL}/(matching)/active-rides`);
  await waitForText(pageB, "Chuyến đi của bạn", 15_000);
  await pageB.waitForTimeout(1500);
  await click(pageB, "Xem chuyến đi");
  await waitForText(pageB, "Đang di chuyển", 10_000);

  // ── Both: Confirm finish ─────────────────────────────────────────────────
  console.log("Both confirming ride finish…");
  await Promise.all([
    (async () => {
      await click(pageA, "Tôi đã đến nơi");
      await pageA.waitForTimeout(500);
      // web confirm dialog
      pageA.on("dialog", (d) => d.accept());
    })(),
    (async () => {
      await pageB.waitForTimeout(1000);
      await click(pageB, "Tôi đã đến nơi");
      pageB.on("dialog", (d) => d.accept());
    })(),
  ]);

  await waitForText(pageA, "Thanh toán", 20_000);
  console.log("Both confirmed finish → awaiting_payment ✓");

  // ── Both: Confirm payment ────────────────────────────────────────────────
  console.log("Both confirming payment…");
  // pageA auto-navigated to /payment; navigate pageB
  await pageB.waitForURL(/payment/, { timeout: 15_000 });

  await Promise.all([
    (async () => {
      await click(pageA, "Tôi đã nhận tiền");
      pageA.on("dialog", (d) => d.accept());
    })(),
    (async () => {
      await pageB.waitForTimeout(1000);
      await click(pageB, "Tôi đã trả tiền");
      pageB.on("dialog", (d) => d.accept());
    })(),
  ]);

  // ── Verify completed ─────────────────────────────────────────────────────
  await waitForText(pageA, "Chuyến đi đã hoàn thành", 20_000);
  console.log("Ride completed ✓");

  await browser.close();
});
