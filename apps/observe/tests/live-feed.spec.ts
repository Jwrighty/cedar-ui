import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("filters and sort are reconstructable from the URL", async ({ page }) => {
  await page.goto("/runs");
  await expect(page.getByTestId("runs-table")).toBeVisible();

  // Filter to error status.
  await page
    .getByTestId("runs-filter-bar")
    .getByLabel("Status")
    .selectOption("error");
  await expect(page).toHaveURL(/status=error/);

  // Sort by cost (click the Cost header button once → desc, since it's a new field).
  const costHeader = page
    .getByRole("columnheader", { name: /Cost/ })
    .getByRole("button");
  await costHeader.click();
  await expect(page).toHaveURL(/sort=cost%3Adesc|sort=cost:desc/);

  // Reload reconstructs the same view.
  await page.reload();
  await expect(page).toHaveURL(/status=error/);
  await expect(
    page.getByTestId("runs-filter-bar").getByLabel("Status"),
  ).toHaveValue("error");

  // Back button restores prior state.
  await page.goBack();
  await expect(page).not.toHaveURL(/sort=cost/);
  await expect(page).toHaveURL(/status=error/);
});

test("empty state appears for an impossible filter and resets", async ({
  page,
}) => {
  // Deep-link straight to a filter that matches nothing.
  await page.goto("/runs?status=error&model=does-not-exist");
  await expect(page.getByTestId("runs-empty")).toBeVisible();
  await page
    .getByTestId("runs-empty")
    .getByRole("button", { name: "Reset filters" })
    .click();
  await expect(page).toHaveURL(/\/runs$/);
  await expect(page.getByTestId("runs-empty")).toHaveCount(0);
});

test("infinite scroll loads additional rows", async ({ page }) => {
  await page.goto("/runs");
  const rows = page.getByTestId("runs-table").getByRole("link");
  await expect(rows.first()).toBeVisible();
  const initial = await rows.count();
  await page.mouse.wheel(0, 20000);
  await expect(async () => {
    expect(await rows.count()).toBeGreaterThan(initial);
  }).toPass();
});

test("has no detectable accessibility violations", async ({ page }) => {
  await page.goto("/runs");
  await expect(page.getByTestId("runs-table")).toBeVisible();

  await page.addScriptTag({
    content: await readFile(
      new URL(
        "../../../node_modules/.pnpm/node_modules/axe-core/axe.min.js",
        import.meta.url,
      ),
      "utf8",
    ),
  });

  const violations = await page.evaluate(async () => {
    const target = document.querySelector('[data-testid="runs-table"]');

    if (!target) {
      return [{ id: "missing-runs-table", nodes: [] }];
    }

    const axe = (
      window as typeof window & {
        axe: {
          run: (
            target: Element,
            options?: unknown,
          ) => Promise<{
            violations: Array<{
              id: string;
              nodes: Array<{ target: string[] }>;
            }>;
          }>;
        };
      }
    ).axe;

    return (await axe.run(target)).violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target),
    }));
  });

  expect(violations).toEqual([]);
});

test("announces settled new runs to assistive technology", async ({ page }) => {
  await page.goto("/runs");
  const announcer = page.getByTestId("runs-live-announcer");
  await expect(announcer).toHaveAttribute("aria-live", "polite");
  // In test mode the SSE burst completes in a few seconds; the announcer
  // updates once the arrivals settle (debounced), not per event.
  await expect(announcer).toContainText(/new runs? added to the feed/, {
    timeout: 15000,
  });
});
