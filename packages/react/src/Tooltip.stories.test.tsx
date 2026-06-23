import { describe, expect, it } from "vitest";
import { Placements, PosedOpen, Themes } from "./Tooltip.stories";

describe("Tooltip stories", () => {
  it.each([
    ["PosedOpen", PosedOpen],
    ["Placements", Placements],
    ["Themes", Themes],
  ])(
    "keeps forced-open %s visual regression fixtures out of autodocs",
    (_name, story) => {
      expect(story.tags).toContain("!autodocs");
    },
  );
});
