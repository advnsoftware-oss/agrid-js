## Releases

Releases are managed with changeset, you can find more information on the [changeset repository](https://github.com/changesets/changesets).

Before submitting a PR, create a changeset by running:
```
pnpm changeset
```

CLI will prompt questions about the changes you've made and will generate a changeset file for you.

Add a `release` label to your PR to publish automatically your changes when it's merged.

# for agrid-js browser sdk

When we run post-merge actions for the browser SDK we publish to NPM.

For detailed publishing instructions, see [docs/PUBLISH_NPM.md](./docs/PUBLISH_NPM.md).
