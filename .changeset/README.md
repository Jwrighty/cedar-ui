# Changesets

Cedar uses [Changesets](https://github.com/changesets/changesets) to manage
versioning and changelogs. Every change that affects a published package
(`@jwrighty/cedar-tokens`, `@jwrighty/cedar-react`) should ship with a changeset declaring
its semver intent.

## Adding a changeset

```sh
pnpm changeset
```

Pick the affected packages, choose `patch` / `minor` / `major`, and write a
one-line summary. This drops a markdown file in `.changeset/` — commit it with
your change.

## How it ships

On merge to `main`, the release workflow (`.github/workflows/release.yml`) runs
the Changesets action. It either:

- opens / updates a **"Version Packages"** PR that consumes the pending
  changesets, bumps versions, and writes `CHANGELOG.md` entries; or
- if that PR is merged, runs `pnpm release` to publish the bumped packages to
  npm.

The private apps (`docs`, `playground`) are listed under `ignore` in
`config.json` and are never versioned or published.
