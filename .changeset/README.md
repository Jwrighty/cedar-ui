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

For straightforward agent work where the affected package(s), bump type, and
summary are obvious, it is also fine to create the `.changeset/*.md` file
directly. Use the same frontmatter shape that `pnpm changeset` emits, for
example:

```md
---
"@jwrighty/cedar-react": patch
---

Add canonical examples to the agent manifest.
```

## Agent and CI check

Any diff that touches `packages/tokens/**` or `packages/react/**` must include a
new `.changeset/*.md` file. Before handing off that work, run:

```sh
pnpm changeset:check --since=origin/main
```

That command verifies committed, staged, unstaged, and untracked files include a
changeset for published package changes, then runs
`pnpm changeset status --since=origin/main`.

## How it ships

On merge to `main`, the release workflow (`.github/workflows/release.yml`) runs
the Changesets action. It either:

- opens / updates a **"Version Packages"** PR that consumes the pending
  changesets, bumps versions, and writes `CHANGELOG.md` entries; or
- if that PR is merged, runs `pnpm release` to publish the bumped packages to
  npm.

The private apps (`docs`, `playground`) are listed under `ignore` in
`config.json` and are never versioned or published.
