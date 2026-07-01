import { describe, expect, it } from "vitest";
import { DEFAULT_SORT, parseRunsQuery, serializeSort } from "./runs-query";

describe("parseRunsQuery", () => {
  it("defaults to time:desc with no filters", () => {
    const q = parseRunsQuery(new URLSearchParams());
    expect(q.sortField).toBe("time");
    expect(q.sortDir).toBe("desc");
    expect(q.status).toBeNull();
    expect(q.model).toBeNull();
    expect(q.environment).toBeNull();
  });

  it("reads filters and a valid sort", () => {
    const q = parseRunsQuery(
      new URLSearchParams(
        "status=error&model=o4-mini&env=staging&sort=cost:asc&from=2026-02-24T00:00:00.000Z",
      ),
    );
    expect(q.status).toBe("error");
    expect(q.model).toBe("o4-mini");
    expect(q.environment).toBe("staging");
    expect(q.sortField).toBe("cost");
    expect(q.sortDir).toBe("asc");
    expect(q.from).toBe("2026-02-24T00:00:00.000Z");
  });

  it("rejects invalid enum/sort values, falling back to defaults", () => {
    const q = parseRunsQuery(
      new URLSearchParams("status=nope&env=prod&sort=bogus:sideways"),
    );
    expect(q.status).toBeNull();
    expect(q.environment).toBeNull();
    expect(q.sortField).toBe(DEFAULT_SORT.field);
    expect(q.sortDir).toBe(DEFAULT_SORT.dir);
  });

  it("serializeSort round-trips", () => {
    expect(serializeSort("latency", "asc")).toBe("latency:asc");
  });
});
