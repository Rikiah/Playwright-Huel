import { chromium, test, expect } from "@playwright/test";

test("E2E Test Add two items to basket", async () => {
  // Launch headless Chromium browser
  const browser = await chromium.launch();

  test.setTimeout(600000);

  // Create a new page
  const context = await browser.newContext();
  const page = await context.newPage();

  // Home Page - Huel Landing Page
  console.log("Navigating to Huel landing page.");
  await page.goto("https://huel.com/");

  // Accept Geo-locator in order to locate to UK Huel
  console.log("Accepting Geo-locator to UK.");
  await page.locator("#geolocation-app").getByText("Continue").click();

  // Accept Terms & Conditions
  console.log("Accepting Terms & Conditions.");
  await page.getByRole("button", { name: "Accept" }).click();

  // Search and add the first item to the basket
  console.log("Searching and adding the first item to the basket...");
  await page.getByTestId("IconLink-Search").click();
  await page.getByTestId("SearchBar__input").click();
  await page.getByTestId("SearchBar__input").fill("Complete");
  await page.getByTestId("SearchBar__input").press("Enter");
  await page.getByRole("link", { name: "Shop Complete Protein" }).click();
  await page.getByRole("button", { name: "Vanilla Increase Quantity" }).click();

  await page.waitForTimeout(2000);

  // Search and add the second item to the basket
  console.log("Searching and adding the second item to the basket...");
  await page.getByTestId("IconLink-Search").click();
  await page.getByTestId("SearchBar__input").click();
  await page.getByTestId("SearchBar__input").fill("Nutrition Bar");
  await page.getByTestId("SearchBar__input").press("Enter");
  await page.getByRole("link", { name: "Shop Complete Nutrition Bar" }).click();
  await page.getByRole("button", { name: "Dark Chocolate Raspberry" }).click();

  await page.waitForTimeout(2000);

  // Proceed to checkout
  console.log("Proceeding to checkout...");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#purchaseStatus-onetime").click();
  await page.getByRole("button", { name: "Continue" }).click();

  console.log("Waiting for the cart page to load...");

  //   await page.waitForURL("https://uk.huel.com/cart");
  // await page.waitForLoadState();
  // await page.goto("https://uk.huel.com/cart");

  //   // Verify both items are in the basket
  //   const basketContent = await page.textContent("heading", {
  //     name: "Your basket",
  //   });
  //   expect(basketContent).toContain("Complete Protein");
  //   expect(basketContent).toContain("Complete Nutrition Bar");

  //   // Verify the total number of items in the basket is 2
  //   const basketItems = await page.$$("heading", { name: "Bundle" });
  //   expect(basketItems.length).toBe(2);

  //   // Close the browser
  //   await browser.close();
});

// await page.getByRole('heading', { name: 'Your basket' }).click();
// await page.getByText('Huel Complete Nutrition Bar Dark Chocolate Raspberry x').click();
// await page.locator('div').filter({ hasText: 'Huel Complete Nutrition Bar' }).nth(4).click();
// await page.locator('div').filter({ hasText: 'Huel Complete Protein Vanilla' }).nth(4).click();
// await page.locator('div').filter({ hasText: 'Your basket 2 Items Clear' }).nth(1).click();
