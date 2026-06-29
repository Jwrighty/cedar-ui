import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

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
  await expect(
    page.getByRole("heading", { name: "Recent runs" }),
  ).toBeVisible();
  await expect(
    page.getByText(/deterministic seed data with tuned Suspense boundaries/),
  ).toBeVisible();
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

test("swaps light shell backgrounds while keeping dark surfaces", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator(".dashboard-shell")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expect(page.locator(".dashboard-sidebar")).toHaveCSS(
    "background-color",
    "rgb(252, 252, 252)",
  );

  await page.getByRole("button", { name: "Switch to dark theme" }).click();

  await expect(page.locator(".dashboard-shell")).toHaveCSS(
    "background-color",
    "rgb(18, 18, 18)",
  );
  await expect(page.locator(".dashboard-sidebar")).toHaveCSS(
    "background-color",
    "rgb(23, 23, 23)",
  );
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
  await expect(page.getByTestId("overview-recent-runs-skeleton")).toBeVisible();
  await expect(page.getByTestId("overview-recent-runs")).toBeVisible();
});

test("renders recent runs with status pills and trace links", async ({
  page,
}) => {
  await page.goto("/");

  const recentRuns = page.getByTestId("overview-recent-runs");
  await expect(recentRuns).toBeVisible();
  await expect(
    recentRuns.getByRole("link", { name: "View feed" }),
  ).toHaveAttribute("href", "/runs");
  await expect(
    recentRuns.getByRole("columnheader", { name: "Tokens" }),
  ).toBeVisible();
  await expect(
    recentRuns.getByText(/Running|Success|Error/).first(),
  ).toBeVisible();
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
    const target = document.querySelector(
      '[data-testid="overview-recent-runs"]',
    );

    if (!target) {
      return [{ id: "missing-recent-runs", nodes: [] }];
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

  const firstTraceLink = recentRuns
    .getByRole("link", { name: /Open trace for/ })
    .first();
  await expect(firstTraceLink).toHaveAttribute("href", "/runs/run_0001");

  await firstTraceLink.click();
  await expect(page).toHaveURL(/\/runs\/run_0001$/);
  await expect(
    page.locator(".trace-hero").getByText("Trace detail"),
  ).toBeVisible();
});

test("keeps Stat values and deltas from overlapping at narrow card widths", async ({
  page,
}) => {
  const statCss = await readFile(
    new URL("../../../packages/react/src/Stat.module.css", import.meta.url),
    "utf8",
  );

  await page.setContent(`
    <!doctype html>
    <style>
      :root {
        --semantic-space-stack-md: 16px;
        --semantic-space-gap-md: 16px;
        --semantic-color-text-muted: #555;
        --semantic-font-body-family: Arial, sans-serif;
        --base-font-size-sm: 24px;
        --semantic-font-label-weight: 700;
        --base-font-line-height-normal: 1.2;
        --semantic-color-text-default: #111;
        --base-font-size-2xl: 64px;
        --base-font-weight-semibold: 700;
        --base-font-line-height-tight: 1;
        --semantic-color-status-success-foreground: #087a55;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 24px;
      }

      .card {
        width: 336px;
        padding: 24px;
        border: 1px solid #ddd;
        border-radius: 22px;
        overflow: hidden;
      }

      ${statCss}
    </style>
    <div class="card stat">
      <div class="body">
        <div class="content">
          <div class="header">
            <p class="label">P95 latency</p>
            <div class="delta positive">-4%</div>
          </div>
          <div class="value">9,336ms</div>
        </div>
      </div>
    </div>
  `);

  const collisionRisk = await page.evaluate(() => {
    const value = document.querySelector(".value");
    const delta = document.querySelector(".delta");

    if (!(value instanceof HTMLElement) || !(delta instanceof HTMLElement)) {
      return true;
    }

    const valueBox = value.getBoundingClientRect();
    const deltaBox = delta.getBoundingClientRect();

    // The delta now sits on the label row above the value, so the value owns
    // the full width and never wraps mid-token or collides with the delta.
    const valueOverflows = value.scrollWidth > value.clientWidth + 1;
    const deltaOverlapsValue = deltaBox.bottom > valueBox.top + 1;

    return valueOverflows || deltaOverlapsValue;
  });

  expect(collisionRisk).toBe(false);
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
