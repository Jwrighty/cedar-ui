import { describe, expect, it } from "vitest";
import { AutoOpen, Stacking, Variants } from "./Toast.stories";

describe("Toast stories", () => {
  it.each([
    ["AutoOpen", AutoOpen],
    ["Stacking", Stacking],
    ["Variants", Variants],
  ])(
    "keeps posed %s visual regression fixtures out of autodocs",
    (_name, story) => {
      expect(story.tags).toContain("!autodocs");
    },
  );
});
