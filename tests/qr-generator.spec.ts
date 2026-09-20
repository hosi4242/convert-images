import { expect, test } from "@playwright/test";
import { existsSync } from "node:fs";

test("generates and downloads a QR code as qr-code.png", async ({ page }, testInfo) => {
  await page.goto("/");

  await page.getByRole("button", { name: /QR (코드|Code)/ }).click();
  await page.locator("textarea").fill("https://example.com");

  await expect(page.locator("canvas")).toBeVisible();

  const downloadButton = page.getByRole("button", {
    name: /(?:QR 코드 다운로드|Download QR Code)/,
  });
  await expect(downloadButton).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await downloadButton.click();
  const download = await downloadPromise;
  const downloadPath = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(downloadPath);

  expect(download.suggestedFilename()).toBe("qr-code.png");
  expect(existsSync(downloadPath)).toBe(true);
});
