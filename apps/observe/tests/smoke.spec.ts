import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("renders the dashboard shell around seeded observe data", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("button", { name: "Collapse sidebar" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Live run health" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recent runs" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
      name: "Trace detail",
    }),
  ).toHaveCount(0);
  await expect(
    page.getByText(/deterministic seed data with tuned Suspense boundaries/),
  ).toBeVisible();
  await expect(page.getByTestId("overview-metric-runs")).toBeVisible();
});

test("uses xl padding for overview dashboard cards and stats", async ({
  page,
}) => {
  await page.setViewportSize({ width: 500, height: 900 });
  await page.goto("/");

  const overviewSurfaceTestIds = [
    "overview-metric-runs",
    "overview-metric-successRate",
    "overview-metric-totalCost",
    "overview-metric-p95Latency",
    "overview-chart-runs-over-time",
    "overview-chart-cost-by-model",
    "overview-chart-latency-distribution",
    "overview-recent-runs",
  ];

  for (const testId of overviewSurfaceTestIds) {
    await expect(page.getByTestId(testId)).toHaveCSS("padding", "24px");
  }

  await page.goto("/?metricError=totalCost");

  await expect(page.getByRole("group", { name: "Total cost" })).toHaveCSS(
    "padding",
    "24px",
  );
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
  const metricKeys = ["runs", "successRate", "totalCost", "p95Latency"];

  // Record the moment each skeleton and each loaded metric first lands in the
  // DOM. Asserting against this in-page history — rather than Playwright's
  // `toBeVisible`, whose polling is throttled while the document is still
  // streaming — keeps the ordering checks from racing the reveal.
  await page.addInitScript((keys) => {
    const firstSeen: Record<string, number> = {};
    const start = performance.now();
    const capture = () => {
      for (const key of keys) {
        const skeleton = `skeleton-${key}`;
        if (
          firstSeen[skeleton] === undefined &&
          document.querySelector(
            `[data-testid="overview-metric-skeleton-${key}"]`,
          )
        ) {
          firstSeen[skeleton] = performance.now() - start;
        }
        if (
          firstSeen[key] === undefined &&
          document.querySelector(`[data-testid="overview-metric-${key}"]`)
        ) {
          firstSeen[key] = performance.now() - start;
        }
      }
    };
    const interval = setInterval(() => {
      capture();
      if (keys.every((key) => firstSeen[key] !== undefined)) {
        clearInterval(interval);
      }
    }, 10);
    capture();
    (
      window as unknown as { __observeStream: typeof firstSeen }
    ).__observeStream = firstSeen;
  }, metricKeys);

  // `?testMode=1` forces the staggered server latencies regardless of whether
  // the dev server under test was started with OBSERVE_TEST_MODE=1, so a reused
  // local dev server can't collapse the streaming window.
  await page.goto("/?testMode=1", { waitUntil: "commit" });

  await expect(page.getByTestId("overview-metric-skeleton-runs")).toBeVisible();
  await expect(
    page.getByTestId("overview-metric-skeleton-p95Latency"),
  ).toBeVisible();

  // Wait until every metric has streamed in before reading the history.
  await expect(page.getByTestId("overview-metric-p95Latency")).toBeVisible();

  const firstSeen = await page.evaluate(
    () =>
      (window as unknown as { __observeStream: Record<string, number> })
        .__observeStream,
  );

  // Every metric rendered as a skeleton before its data replaced it.
  for (const key of metricKeys) {
    const skeletonAt = firstSeen[`skeleton-${key}`];
    const metricAt = firstSeen[key];
    expect(skeletonAt, `skeleton for ${key} should render`).toBeDefined();
    expect(metricAt, `metric ${key} should render`).toBeDefined();
    expect(skeletonAt ?? Infinity).toBeLessThan(metricAt ?? -Infinity);
  }

  // Metrics resolved in deterministic streaming order.
  const loadOrder = [...metricKeys].sort(
    (a, b) => (firstSeen[a] ?? 0) - (firstSeen[b] ?? 0),
  );
  expect(loadOrder).toEqual(metricKeys);

  await expect(page.getByTestId("overview-recent-runs-skeleton")).toBeVisible();
  await expect(page.getByTestId("overview-recent-runs")).toBeVisible();
});

test("replays the Overview loading choreography with slow motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?testMode=1", { waitUntil: "commit" });

  await expect(page.getByTestId("overview-metric-runs")).toBeVisible();
  await expect(page.getByTestId("demo-mode-control")).toBeVisible();
  await expect(page.getByRole("button", { name: "2x" })).toBeEnabled();

  await page.getByRole("button", { name: "2x" }).click();

  await expect(page).toHaveURL(/slowMo=2/);
  await expect(page.getByTestId("overview-metric-skeleton-runs")).toBeVisible();
  // The slow-mo duration is now `calc(var(--base-motion-duration-base) * 2)`,
  // which getPropertyValue won't reduce to a plain `ms` value. Resolve it via a
  // probe element's transition-delay (a property the reduced-motion override
  // leaves alone) so we assert the real 220ms * 2 = 440ms.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const probe = document.createElement("div");
        probe.style.transitionDelay = "var(--semantic-motion-duration-settle)";
        document.querySelector(".observe-panel")!.append(probe);
        const value = getComputedStyle(probe).transitionDelay;
        probe.remove();
        return value;
      }),
    )
    .toBe("0.44s");
  await expect(page.getByTestId("overview-metric-runs")).toBeVisible({
    timeout: 3000,
  });

  await page.getByRole("button", { name: "Replay" }).click();

  await expect(page.getByTestId("overview-metric-skeleton-runs")).toBeVisible();
  await expect(page.getByTestId("overview-metric-runs")).toBeVisible({
    timeout: 3000,
  });
  await expect(page.getByTestId("overview-chart-runs-over-time")).toBeVisible({
    timeout: 7000,
  });
  await expect(page.locator(".overview-chart__draw--sweep").first()).toHaveCSS(
    "animation-name",
    "none",
  );
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
  await expect
    .poll(() =>
      page.evaluate(() => {
        const runLink = document.querySelector(".recent-runs-link");

        if (!(runLink instanceof HTMLElement)) {
          return false;
        }

        return (
          window.getComputedStyle(runLink).color ===
          window.getComputedStyle(document.body).color
        );
      }),
    )
    .toBe(true);
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
  const brandMark = page.locator(".dashboard-brand__mark");
  const firstNavIcon = page.locator(".dashboard-nav__icon").first();
  const centerX = (locator: typeof brandMark) =>
    locator.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.x + rect.width / 2;
    });
  const expandedBrandMarkCenter = await centerX(brandMark);
  const expandedNavIconCenter = await centerX(firstNavIcon);

  await toggle.focus();
  await page.keyboard.press("Enter");

  await expect(shell).toHaveClass(/dashboard-shell--collapsed/);
  await page.waitForFunction(() => {
    const sidebar = document.querySelector(".dashboard-sidebar");
    return sidebar
      ? sidebar.getBoundingClientRect().width > 200 &&
          document
            .querySelector(".dashboard-shell")
            ?.classList.contains("dashboard-shell--collapsed")
      : false;
  });
  expect(
    Math.abs((await centerX(brandMark)) - expandedBrandMarkCenter),
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs((await centerX(firstNavIcon)) - expandedNavIconCenter),
  ).toBeLessThanOrEqual(1);
  await expect(
    page.getByRole("button", { name: "Expand sidebar" }),
  ).toBeVisible();
  await expect(page.locator(".dashboard-sidebar__label").first()).toHaveCSS(
    "white-space",
    "nowrap",
  );
  await expect(page.locator(".dashboard-sidebar__label").first()).toHaveCSS(
    "inline-size",
    "0px",
  );

  const brandHeight = await page
    .locator(".dashboard-brand")
    .evaluate((element) => element.getBoundingClientRect().height);
  const brandMarkHeight = await page
    .locator(".dashboard-brand__mark")
    .evaluate((element) => element.getBoundingClientRect().height);
  expect(brandHeight).toBe(brandMarkHeight);

  const collapsedNavLinkBox = await page
    .locator(".dashboard-nav__link")
    .first()
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { height: rect.height, width: rect.width };
    });
  expect(collapsedNavLinkBox).toEqual({ height: 32, width: 32 });
  await expect(firstNavIcon).toHaveCSS("width", "16px");

  await expect(
    page.getByRole("button", { name: "Switch to dark theme" }),
  ).toHaveCSS("padding", "0px");
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

test("opens a feed trace as an overlay and restores focus on close", async ({
  page,
}) => {
  await page.goto("/runs?status=success&slowMo=4");

  const firstRun = page
    .getByTestId("runs-table")
    .getByRole("link", { name: /Open trace for/ })
    .first();
  await expect(firstRun).toBeVisible();
  const openedRunId = await firstRun.getAttribute("data-run-id");
  expect(openedRunId).toBeTruthy();
  const openedRun = page.locator(`[data-run-id="${openedRunId}"]`);

  await openedRun.focus();
  await expect(openedRun).toBeFocused();
  await openedRun.press("Enter");

  // Opens as a Cedar Dialog at the intercepting route, preserving feed URL state.
  await expect(page).toHaveURL(/\/runs\/run_/);
  expect(new URL(page.url()).searchParams.get("slowMo")).toBe("4");
  await expect(page.getByTestId("trace-overlay")).toBeVisible();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // The dialog is labelled by the trace heading (Cedar forwards aria-labelledby).
  await expect(dialog).toHaveAccessibleName(
    (await page.locator(".trace-identity__title").innerText()).trim(),
  );
  // React Aria moves focus into the dialog on open.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const dialogEl = document.querySelector('[role="dialog"]');
        return !!dialogEl && dialogEl.contains(document.activeElement);
      }),
    )
    .toBe(true);

  // The feed stays mounted, but React Aria marks everything outside the dialog
  // `inert`, so the background is unreachable by pointer, keyboard, or AT.
  await expect(page.getByTestId("runs-table")).toBeAttached();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          !!document
            .querySelector('[data-testid="runs-table"]')
            ?.closest("[inert]"),
      ),
    )
    .toBe(true);

  await page.getByRole("button", { name: "Close trace overlay" }).click();

  // Closing returns to the feed with filters intact, tears the dialog down,
  // un-hides the background, and restores focus to the originating row.
  await expect.poll(() => new URL(page.url()).pathname).toBe("/runs");
  expect(new URL(page.url()).searchParams.get("status")).toBe("success");
  expect(new URL(page.url()).searchParams.get("slowMo")).toBe("4");
  await expect(page.getByTestId("trace-overlay")).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        !!document
          .querySelector('[data-testid="runs-table"]')
          ?.closest("[inert]"),
    ),
  ).toBe(false);
  await expect(openedRun).toBeFocused();
});
