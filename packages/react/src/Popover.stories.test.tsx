import { Placements, Sizes, Themes } from "./Popover.stories";

import { describe, expect, it } from "vitest";

describe("Popover stories", () => {
  it.each([
    ["Sizes", Sizes],
    ["Placements", Placements],
    ["Themes", Themes],
  ])(
    "keeps forced-open %s visual regression fixtures out of autodocs",
    (_name, story) => {
      expect(story.tags).toContain("!autodocs");
    },
  );
});
