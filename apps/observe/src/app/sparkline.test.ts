import { describe, expect, it } from "vitest";

import { normalizePoints, toAreaPath, toSmoothPath } from "./sparkline";

const view = { width: 100, height: 50, padding: 2 };

describe("normalizePoints", () => {
  it("maps the lowest value to the baseline and the highest to the top", () => {
    const points = normalizePoints([1, 2, 3], view);

    expect(points[0]).toEqual([2, 48]);
    expect(points[2]).toEqual([98, 2]);
  });

  it("places flat data on a single horizontal line without dividing by zero", () => {
    const points = normalizePoints([5, 5, 5], view);

    expect(points.every(([, y]) => Number.isFinite(y))).toBe(true);
    expect(points[0]?.[1]).toBe(points[2]?.[1]);
  });
});

describe("toSmoothPath", () => {
  it("starts at the first point and draws one curve per remaining point", () => {
    const path = toSmoothPath([
      [0, 0],
      [1, 1],
      [2, 0],
    ]);

    expect(path.startsWith("M0 0")).toBe(true);
    expect(path.match(/C/g)).toHaveLength(2);
  });

  it("keeps control points within the data range so sharp valleys never overshoot", () => {
    const points: Array<[number, number]> = [
      [0, 2],
      [10, 46],
      [20, 46],
      [30, 46],
    ];
    const ys = [...toSmoothPath(points).matchAll(/-?\d+(?:\.\d+)?/g)]
      .map((match, index) => ({ value: Number(match[0]), index }))
      .filter((entry) => entry.index % 2 === 1)
      .map((entry) => entry.value);

    expect(Math.min(...ys)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...ys)).toBeLessThanOrEqual(46);
  });
});

describe("toAreaPath", () => {
  it("closes the line down to the baseline", () => {
    const points: Array<[number, number]> = [
      [2, 10],
      [98, 20],
    ];
    const area = toAreaPath(toSmoothPath(points), points, view.height);

    expect(area.endsWith("Z")).toBe(true);
    expect(area).toContain(`L98 ${view.height}`);
    expect(area).toContain(`L2 ${view.height}`);
  });
});
