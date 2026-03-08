import { test, expect } from "@playwright/test";

test.describe("API endpoints", () => {
  test("GET /api/health returns 200", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body).toHaveProperty("timestamp");
  });

  test("POST /api/roast without body returns 400", async ({ request }) => {
    const response = await request.post("/api/roast", {
      data: {},
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("required");
  });

  test("GET /api/roast returns 405", async ({ request }) => {
    const response = await request.get("/api/roast");
    expect(response.status()).toBe(405);
  });

  test("POST /api/roast with invalid URL returns 400", async ({ request }) => {
    const response = await request.post("/api/roast", {
      data: { url: "not-a-url" },
    });
    expect(response.status()).toBe(400);
  });
});

test.describe("Homepage", () => {
  test("renders title and URL input", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("AI Website Roaster");
    await expect(page.locator("#url-input")).toBeVisible();
  });

  test("has roast submit button", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator('button[type="submit"]'),
    ).toContainText("Roast This Site");
  });
});
