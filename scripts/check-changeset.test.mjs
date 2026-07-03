import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getChangesetFiles,
  getChangesetRequirement,
  getPublishedPackageChanges,
  parseFileList,
  parseSinceArg,
  uniqueFiles,
} from "./check-changeset.mjs";

test("detects changes under published packages", () => {
  assert.deepEqual(
    getPublishedPackageChanges([
      "packages/tokens/src/base/color.json",
      "packages/react/src/Button.tsx",
      "apps/docs/src/App.tsx",
      ".changeset/new-button.md",
    ]),
    ["packages/tokens/src/base/color.json", "packages/react/src/Button.tsx"],
  );
});

test("detects real changeset files without counting guidance docs", () => {
  assert.deepEqual(
    getChangesetFiles([
      ".changeset/README.md",
      ".changeset/new-button.md",
      ".changeset/config.json",
      "docs/RELEASING.md",
    ]),
    [".changeset/new-button.md"],
  );
});

test("requires a changeset when a published package changes", () => {
  assert.deepEqual(getChangesetRequirement(["packages/react/src/Button.tsx"]), {
    isRequired: true,
    isSatisfied: false,
    packageChanges: ["packages/react/src/Button.tsx"],
    changesetFiles: [],
  });
});

test("satisfies the requirement with a changeset in the same diff", () => {
  assert.deepEqual(
    getChangesetRequirement([
      "packages/tokens/src/base/color.json",
      ".changeset/new-token.md",
    ]),
    {
      isRequired: true,
      isSatisfied: true,
      packageChanges: ["packages/tokens/src/base/color.json"],
      changesetFiles: [".changeset/new-token.md"],
    },
  );
});

test("does not require a changeset for private app changes", () => {
  assert.deepEqual(getChangesetRequirement(["apps/docs/src/App.tsx"]), {
    isRequired: false,
    isSatisfied: true,
    packageChanges: [],
    changesetFiles: [],
  });
});

test("parses since arguments", () => {
  assert.equal(parseSinceArg([]), "origin/main");
  assert.equal(parseSinceArg(["--since", "upstream/main"]), "upstream/main");
  assert.equal(parseSinceArg(["--since=origin/release"]), "origin/release");
});

test("parses git file lists", () => {
  assert.deepEqual(parseFileList("packages/react/src/Button.tsx\n\n"), [
    "packages/react/src/Button.tsx",
  ]);
});

test("deduplicates and sorts changed files from committed and working tree diffs", () => {
  assert.deepEqual(
    uniqueFiles([
      "packages/react/src/Button.tsx",
      ".changeset/new-button.md",
      "packages/react/src/Button.tsx",
      "apps/docs/src/App.tsx",
    ]),
    [
      ".changeset/new-button.md",
      "apps/docs/src/App.tsx",
      "packages/react/src/Button.tsx",
    ],
  );
});
