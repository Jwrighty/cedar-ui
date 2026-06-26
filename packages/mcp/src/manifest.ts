import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import type { CedarManifest } from "./types.js";

const require = createRequire(import.meta.url);

export async function loadManifest(
  manifestPath = process.env.CEDAR_MANIFEST_PATH,
): Promise<CedarManifest> {
  const resolvedPath =
    manifestPath ?? require.resolve("@jwrighty/cedar-react/cedar.manifest.json");
  const manifest = JSON.parse(await readFile(resolvedPath, "utf8")) as CedarManifest;

  assertManifest(manifest, resolvedPath);

  return manifest;
}

function assertManifest(manifest: CedarManifest, source: string) {
  if (!Array.isArray(manifest.components)) {
    throw new Error(`Cedar manifest at ${source} does not include a components array.`);
  }

  if (!Array.isArray(manifest.tokens?.sources)) {
    throw new Error(`Cedar manifest at ${source} does not include token sources.`);
  }
}
