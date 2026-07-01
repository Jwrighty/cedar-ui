import { expect, test } from "@playwright/test";

test("tagging a run applies optimistically and shows a toast", async ({ page }) => {
  await page.goto("/runs");
  const firstRow = page.getByTestId("runs-table").getByRole("link").first();
  await expect(firstRow).toBeVisible();

  // Add a tag on the first row via its add button.
  const addButton = page.getByTestId(/^run-tag-add-/).first();
  await addButton.click();

  await expect(page.getByRole("status").filter({ hasText: "Tag updated" })).toBeVisible();
});
