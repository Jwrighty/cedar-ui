import { expect, test } from "@playwright/test";

test("renders the dashboard shell around seeded observe data", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Agent run telemetry" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Live run health" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByText("Latest run")).toBeVisible();
  await expect(page.getByText(/Rendered from `\/api\/runs`/)).toBeVisible();
  await expect(page.getByTestId("overview-metric-runs")).toBeVisible();
});

test("streams overview metrics from skeletons in deterministic order", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "commit" });

  await expect(page.getByTestId("overview-metric-skeleton-runs")).toBeVisible();
  await expect(
    page.getByTestId("overview-metric-skeleton-p95Latency"),
  ).toBeVisible();

  await expect(page.getByTestId("overview-metric-runs")).toBeVisible();
  await expect(
    page.getByTestId("overview-metric-skeleton-successRate"),
  ).toBeVisible();

  await expect(page.getByTestId("overview-metric-successRate")).toBeVisible();
  await expect(
    page.getByTestId("overview-metric-skeleton-totalCost"),
  ).toBeVisible();

  await expect(page.getByTestId("overview-metric-totalCost")).toBeVisible();
  await expect(
    page.getByTestId("overview-metric-skeleton-p95Latency"),
  ).toBeVisible();

  await expect(page.getByTestId("overview-metric-p95Latency")).toBeVisible();
});

test("shows an isolated metric error with a working retry", async ({
  page,
}) => {
  await page.goto("/?metricError=totalCost");

  await expect(page.getByTestId("overview-metric-runs")).toBeVisible();
  await expect(page.getByTestId("overview-metric-successRate")).toBeVisible();
  await expect(page.getByRole("group", { name: "Total cost" })).toContainText(
    "Unable to load",
  );
  await expect(page.getByTestId("overview-metric-p95Latency")).toBeVisible();

  await page.getByRole("button", { name: "Retry" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByTestId("overview-metric-totalCost")).toBeVisible();
});

test("collapses the sidebar from the keyboard and persists the rail", async ({
  page,
}) => {
  await page.goto("/");

  const shell = page.locator(".dashboard-shell");
  const content = page.locator(".dashboard-content");
  const before = await content.boundingBox();
  const toggle = page.getByRole("button", { name: "Collapse sidebar" });

  await toggle.focus();
  await page.keyboard.press("Enter");

  await expect(shell).toHaveClass(/dashboard-shell--collapsed/);
  await expect(
    page.getByRole("button", { name: "Expand sidebar" }),
  ).toBeVisible();
  await expect(page.locator(".dashboard-sidebar__label").first()).toHaveCSS(
    "white-space",
    "nowrap",
  );
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("observe-sidebar-collapsed")),
    )
    .toBe("true");

  await expect
    .poll(async () => (await content.boundingBox())?.x ?? 0)
    .toBeLessThan(before?.x ?? 0);

  await page.reload();
  await expect(shell).toHaveClass(/dashboard-shell--collapsed/);
});

test("persists theme changes and applies stored dark theme on load", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("observe-theme")))
    .toBe("dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  const secondPage = await page.context().newPage();
  await secondPage.addInitScript(() => {
    localStorage.setItem("observe-theme", "dark");
  });
  await secondPage.goto("/");
  await expect(secondPage.locator("html")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await secondPage.close();
});
