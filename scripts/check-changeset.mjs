import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const publishedPackagePrefixes = ["packages/tokens/", "packages/react/"];
const changesetFilePattern = /^\.changeset\/[^/]+\.md$/;

export function getPublishedPackageChanges(files) {
  return files.filter((file) =>
    publishedPackagePrefixes.some((prefix) => file.startsWith(prefix)),
  );
}

export function getChangesetFiles(files) {
  return files.filter(
    (file) =>
      changesetFilePattern.test(file) && file !== ".changeset/README.md",
  );
}

export function getChangesetRequirement(files) {
  const packageChanges = getPublishedPackageChanges(files);
  const changesetFiles = getChangesetFiles(files);

  return {
    isRequired: packageChanges.length > 0,
    isSatisfied: packageChanges.length === 0 || changesetFiles.length > 0,
    packageChanges,
    changesetFiles,
  };
}

export function parseSinceArg(args) {
  const inlineSinceArg = args.find((arg) => arg.startsWith("--since="));

  if (inlineSinceArg) {
    return inlineSinceArg.slice("--since=".length);
  }

  const sinceFlagIndex = args.indexOf("--since");

  return sinceFlagIndex === -1 ? "origin/main" : args[sinceFlagIndex + 1];
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: "utf8",
    ...options,
  });
}

function getChangedFiles(since) {
  const committed = run("git", ["diff", "--name-only", `${since}...HEAD`]);

  if (committed.status !== 0) {
    throw new Error(
      [
        `Unable to compare this branch with ${since}.`,
        committed.stderr.trim(),
        "Fetch the base branch first, then rerun this check.",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  const workingTree = run("git", ["diff", "--name-only"]);
  const staged = run("git", ["diff", "--cached", "--name-only"]);
  const untracked = run("git", ["ls-files", "--others", "--exclude-standard"]);

  return uniqueFiles([
    ...parseFileList(committed.stdout),
    ...parseFileList(workingTree.stdout),
    ...parseFileList(staged.stdout),
    ...parseFileList(untracked.stdout),
  ]);
}

export function parseFileList(output) {
  return output
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);
}

export function uniqueFiles(files) {
  return [...new Set(files)].sort();
}

function printList(label, files) {
  console.error(label);
  for (const file of files) {
    console.error(`  - ${file}`);
  }
}

export function main({ since = "origin/main" } = {}) {
  const files = getChangedFiles(since);
  const requirement = getChangesetRequirement(files);

  if (!requirement.isRequired) {
    console.log(
      "No changes under packages/tokens/ or packages/react/; skipping changeset check.",
    );
    return 0;
  }

  if (!requirement.isSatisfied) {
    console.error(
      "Changes under a published package require a changeset. Read .changeset/README.md, then run `pnpm changeset` and commit the generated .changeset/*.md file.",
    );
    printList("Published package changes:", requirement.packageChanges);
    return 1;
  }

  const status = run("pnpm", ["changeset", "status", "--since", since], {
    stdio: "inherit",
  });

  return status.status ?? 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const since = parseSinceArg(process.argv.slice(2));

  if (!since) {
    console.error("Usage: pnpm changeset:check [--since <git-ref>]");
    process.exit(1);
  }

  try {
    process.exit(main({ since }));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
