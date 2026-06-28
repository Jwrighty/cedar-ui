import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import type { CedarManifest } from "./types.js";

const require = createRequire(import.meta.url);

/**
 * Load and validate Cedar's generated manifest. Resolves, in order: an explicit
 * `manifestPath`, the `CEDAR_MANIFEST_PATH` environment variable, then the
 * `cedar.manifest.json` shipped inside `@jwrighty/cedar-react` — so the server
 * reads the single generated artifact rather than a copy.
 */
export async function loadManifest(
  manifestPath = process.env.CEDAR_MANIFEST_PATH,
): Promise<CedarManifest> {
  const resolvedPath =
    manifestPath ??
    require.resolve("@jwrighty/cedar-react/cedar.manifest.json");
  const manifest = JSON.parse(
    await readFile(resolvedPath, "utf8"),
  ) as CedarManifest;

  assertManifest(manifest, resolvedPath);

  return manifest;
}

function assertManifest(manifest: CedarManifest, source: string) {
  if (!Array.isArray(manifest.components)) {
    throw new Error(
      `Cedar manifest at ${source} does not include a components array.`,
    );
  }

  if (!Array.isArray(manifest.tokens?.sources)) {
    throw new Error(
      `Cedar manifest at ${source} does not include token sources.`,
    );
  }
}
