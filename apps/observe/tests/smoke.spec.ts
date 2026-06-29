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

test("applies global and Cedar styles on first load", async ({ page }) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt === 0) {
      await page.goto("/", { waitUntil: "commit" });
    } else {
      await page.reload({ waitUntil: "commit" });
    }

    await expect(page.locator(".dashboard-shell")).toHaveCSS("display", "grid");
    await expect(page.locator(".dashboard-nav__link").first()).toHaveCSS(
      "text-decoration-line",
      "none",
    );
    await expect(page.locator(".dashboard-brand__mark")).not.toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
    await expect(page.locator("body")).not.toHaveCSS(
      "font-family",
      '"Times New Roman"',
    );
  }
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

test("renders a deep-linked trace with a streaming waterfall", async ({
  page,
}) => {
  await page.goto("/runs/run_0001");

  await expect(
    page.locator(".trace-hero").getByText("Trace detail"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Execution timeline" }),
  ).toBeVisible();
  await expect(page.getByTestId("trace-waterfall")).toBeVisible();

  const firstBar = page.locator(".trace-span-bar").first();
  await expect(firstBar).toHaveCSS("opacity", "1");

  const secondSpan = page.locator(".trace-span-label").nth(1);
  const secondSpanName = (await secondSpan.innerText()).trim();
  await secondSpan.click();

  await expect(page.getByTestId("trace-detail-panel")).toContainText(
    secondSpanName,
  );
  await expect(page.getByTestId("trace-detail-panel")).toContainText(
    /completed for/,
  );
  await expect(page.locator(".trace-settled-result")).toContainText(
    /settled as|still running/,
  );
});
