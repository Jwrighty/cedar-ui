import { expect, test } from "@playwright/test";

test("renders seeded observe data through the walking skeleton", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Agent run telemetry" }),
  ).toBeVisible();
  await expect(page.getByText("Latest run")).toBeVisible();
  await expect(page.getByText(/Rendered from `\/api\/runs`/)).toBeVisible();
});
