# Releasing Cedar

Cedar publishes `@jwrighty/cedar-tokens` and `@jwrighty/cedar-react` to npm.
Auth uses **npm Trusted Publishing (OIDC)** — no long-lived `NPM_TOKEN` is ever
stored. Because npm cannot bootstrap a _brand-new_ package over OIDC, there are
two distinct flows.

## One-time: first publish of a new package (by hand)

OIDC trusted publishing can only target a package that already exists on the
registry, so the very first version of each package is published manually from a
trusted machine while signed in to npm.

```sh
npm login                       # authenticate (interactive 2FA)
pnpm changeset version          # consume pending changesets → bump versions, write CHANGELOGs
pnpm install                    # refresh the lockfile to the new versions
pnpm build                      # build @jwrighty/cedar-tokens then @jwrighty/cedar-react
pnpm -r publish --access public # publish both packages
```

Then commit the version bump + changelogs and push `main`. Because the
changesets are now consumed, the Release workflow sees nothing pending and does
not attempt to republish.

After this, configure a Trusted Publisher for **each** package:

> npmjs.com → the package → **Settings → Trusted Publisher → GitHub Actions**
> Repository: `Jwrighty/cedar-ui` · Workflow: `release.yml`

## Steady state: automated releases (OIDC)

1. Every change that affects a published package ships with a changeset
   (`pnpm changeset`).
2. On merge to `main`, `.github/workflows/release.yml` runs `changesets/action`,
   which opens/updates a **"Version Packages"** PR consuming the pending
   changesets.
3. Merging that PR runs `pnpm release` (build + `changeset publish`). Publish
   auth is minted from the GitHub OIDC id-token — no secret involved — and build
   provenance is attached.

Requirements baked into the workflow: Node ≥ 22.14, npm ≥ 11.5.1 (upgraded in a
step because `pnpm publish` shells out to the system npm), and
`id-token: write`.
