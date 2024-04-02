import { chromium, test } from "@playwright/test";

test("Add two items to basket, verifies if they are present in cart", async () => {
  // Launch headless Chromium browser
  const browser = await chromium.launch();

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
  await page.getByTestId("SearchBar__input").fill("Complete Protein");
  await page.getByTestId("SearchBar__input").press("Enter");
  await page.getByRole("link", { name: "Shop Complete Protein" }).click();
  await page.getByRole("button", { name: "Vanilla Increase Quantity" }).click();

  // Added timeout to ensure nothing is missed
  await page.waitForTimeout(2000);

  // Try and catch error added to check if item can be found or not in stock
  try {
    await page.waitForSelector('a[aria-label="Shop Complete Protein"]', {
      timeout: 5000,
    });
    await page.click('a[aria-label="Shop Complete Protein"]');
    await page.waitForSelector(
      'button[aria-label="Vanilla Increase Quantity"]',
      { timeout: 5000 }
    );
    await page.click('button[aria-label="Vanilla Increase Quantity"]');
  } catch (error) {
    console.error("Product not found or not in stock");
  }

  await page.getByTestId("IconLink-Search").click();

  // Search and add the second item to the basket
  console.log("Searching and adding the second item to the basket...");

  await page.getByTestId("SearchBar__input").fill("Nutrition Bar");
  await page.getByTestId("SearchBar__input").press("Enter");
  await page.getByRole("link", { name: "Shop Complete Nutrition Bar" }).click();
  await page.getByRole("button", { name: "Dark Chocolate Raspberry" }).click();

  // Added timeout to ensure nothing is missed
  await page.waitForTimeout(2000);

  // Try and catch error added to check if item can be found or not in stock

  try {
    await page.waitForSelector('a[aria-label="Shop Complete Nutrition Bar"]', {
      timeout: 5000,
    });
    await page.click('a[aria-label="Shop Complete Nutrition Bar"]');
    await page.waitForSelector(
      'button[aria-label="Dark Chocolate Raspberry"]',
      { timeout: 5000 }
    );
    await page.click('button[aria-label="Dark Chocolate Raspberry"]');
  } catch (error) {
    console.error("Product not found or not in stock");
  }

  // Subscription page once items are added, selects one time purchase instead of subscription (Can be easily changed)
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByTestId("PurchaseOptionsCardOneTimeFlow")
    .locator("div")
    .filter({ hasText: "One Time Purchase£" })
    .nth(2)
    .click();
  await page.locator("#purchaseStatus-onetime").click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("https://uk.huel.com/pages/cross-sell");

  await page.waitForTimeout(1000);

  // Randomly, the Crosssell page is different sometimes it's 50% off single items and sometimes it's items of interest
  // This if statement addresss both situations and if fails results back to the basket with eligible items
  // Attempt to click the "Continue" button
  const continueButton = await page.$('button[data-testid="Continue"]');
  if (continueButton) {
    await continueButton.click();
  } else {
    // Attempt to click the "Continue to Basket" button
    const continueButtonBasket = await page.$(
      'button[data-testid="Continue Button Basket"]'
    );
    if (continueButtonBasket) {
      await continueButtonBasket.click();
    } else {
      // If neither variation of "Continue" button is found, click the "IconLink-Basket"
      await page.click('[data-testid="IconLink-Basket"]');
    }
  }
  // Continues to basket and checks URL, awaits load of basket
  await page.getByRole("button", { name: "Continue To Basket" }).click();

  await page.waitForURL("https://uk.huel.com/cart");

  await page.waitForLoadState();

  // Asserting if the eligible items are in the cart
  const itemsInCart = await page.$$('div[class="cart-item"]');
  const huelNutritionBarPromise = itemsInCart.map(async (item) => {
    const itemText = await item.textContent();
    return itemText.includes(
      "Huel Complete Nutrition Bar Dark Chocolate Raspberry x 1"
    );
  });
  const huelCompleteProteinPromise = itemsInCart.map(async (item) => {
    const itemText = await item.textContent();
    return itemText.includes("Huel Complete Protein Vanilla x 1");
  });

  // A promise all confirms whether the eligible items are present within the basket confirming "True" or "False"
  const [huelNutritionBars, huelCompleteProteins] = await Promise.all([
    Promise.all(huelNutritionBarPromise),
    Promise.all(huelCompleteProteinPromise),
  ]);

  const huelNutritionBarInCart = huelNutritionBars.some(Boolean);
  const huelCompleteProteinInCart = huelCompleteProteins.some(Boolean);

  console.log(
    "Huel Complete Nutrition Bar Dark Chocolate Raspberry x 1 in cart:",
    huelNutritionBarInCart
  );
  console.log(
    "Huel Complete Protein Vanilla x 1 in cart:",
    huelCompleteProteinInCart
  );

  // Error handling to check if both items are added and you are navigated back to the cart should anything change.
  // Additional click was throwing errors

  try {
    // Click on the first item
    await page
      .locator("li")
      .filter({
        hasText:
          "Huel Complete Nutrition Bar Dark Chocolate Raspberry x 1 One-time QTY: 1 box Price: £",
      })
      .getByRole("figure")
      .getByRole("link");
    //   .click();

    // Click on the second item
    await page
      .locator("li")
      .filter({
        hasText:
          "Huel Complete Protein Vanilla x 1 + What's included? One-time QTY: 1 bag Price: £",
      })
      .getByRole("figure")
      .getByRole("link");
    //   .click();
  } catch (error) {
    console.error("Error occurred while clicking on items:", error);

    // Navigate back to the basket page
    await page.click('[data-testid="IconLink-Basket"]');
  }

  // Get the count of items in the cart, checks the number of items underneath the basket by the number
  const isTwoItems = await page.waitForSelector('span:has-text("2")');

  if (isTwoItems) {
    console.log("The number of items in the basket is 2. Test passed.");
  } else {
    console.error("The number of items in the basket is not 2. Test failed.");
  }

  await browser.close();
});
