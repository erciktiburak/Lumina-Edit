import { test, expect } from "@playwright/test";

test("renders the studio shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Lumina-Edit", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export" })).toBeVisible();
});
