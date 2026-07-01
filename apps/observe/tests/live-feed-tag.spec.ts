import { expect, test, type Page } from "@playwright/test";

async function firstUntaggedRunTags(page: Page) {
  const tags = page
    .locator('[data-testid^="run-tags-"]')
    .filter({ hasNotText: "flagged" })
    .first();
  await expect(tags).toBeVisible();
  const testId = await tags.getAttribute("data-testid");
  expect(testId).not.toBeNull();
  return page.getByTestId(testId!);
}

test("tagging a run applies optimistically and shows a toast", async ({
  page,
}) => {
  await page.goto("/runs");
  await expect(
    page.getByTestId("runs-table").getByRole("link").first(),
  ).toBeVisible();

  const tags = await firstUntaggedRunTags(page);
  const addButton = tags.locator('[data-testid^="run-tag-add-"]');
  await addButton.click();

  await expect(tags).toContainText("flagged");
  await expect(
    page.getByRole("status").filter({ hasText: "Tag updated" }),
  ).toBeVisible();
});

test("tagging a run rolls back and reports failure when the mutation fails", async ({
  page,
}) => {
  await page.route("**/api/runs/*/tags", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Tag rejected" }),
    });
  });

  await page.goto("/runs");
  await expect(
    page.getByTestId("runs-table").getByRole("link").first(),
  ).toBeVisible();

  const tags = await firstUntaggedRunTags(page);
  const addButton = tags.locator('[data-testid^="run-tag-add-"]');

  await addButton.click();
  await expect(tags).toContainText("flagged");
  await expect(
    page.getByRole("status").filter({ hasText: "Couldn’t update tag" }),
  ).toBeVisible();
  await expect(tags).not.toContainText("flagged");
});
