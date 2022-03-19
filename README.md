# Probot & GitHub Action example

> This repository is an example of how to create a GitHub Action using Probot

[![Build Status](https://github.com/probot/example-github-action/workflows/Test/badge.svg)](https://github.com/probot/example-github-action/actions)

If you build a GitHub Action using Probot, we recommend you watch this repository as we will keep updating it implementing best practises and new APIs.

## Usage

You can use the action from this example repository:

```yml
name: Say Hello World
on:
  issues:
    types:
      - opened

jobs:
  sayHelloWorld:
    runs-on: ubuntu-latest
    steps:
      - uses: probot/example-github-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

See the action in ... action [#1](https://github.com/probot/example-github-action/issues/1)

Alternatively, you can pass the token with `with:`

```yml
- uses: probot/example-github-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    # or
    # GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Configuration

GitHub App authentication via `APP_ID`/`PRIVATE_KEY` is not supported. Only token authentication is supported by setting `GITHUB_TOKEN`.

Note that the `LOG_LEVEL` environment variable is ignored. Debug logs are not logged by default in GitHub Actions, but can be enabled by creating a `ACTIONS_STEP_DEBUG` repository secret and setting it to 1.

## How it works

The Probot application function is defined in [`app.js`](app.js).

The Action will run the [`index.js`](index.js) file which verifies the required environment variables are set, loads the Probot application function and then receives the event from the file system.

**Important:** GitHub Actions do not automatically install npm dependencies. Because you need to use `@probot/github-action` and probably other external dependencies, you need to bundle your app into a single file and reference that file as entry `run.mains` in your `action.yml` file. You can use [ncc](https://github.com/vercel/ncc) for that.

This repository is continuously publishing new versions to the special `v1` branch using [`semantic-release`](github.com/semantic-release/semantic-release). See [package.json](package.json). Relevant bits are

1. `"build": "ncc build index.js -o dist"` script - bundle the app into `dist/index.js`
2. `"release"` - configure publishing from the `"main"` branch, and configure the `git` plugin to add a commit after publishing

The other relevant bit is [`.github/workflows/release.yml`](.github/workflows/release.yml), which is run on each push to the default branch (`main`). It installs all dependencies, runs the `build` script, runs semantic-release which creates the GitHub release based on semantic commit message conventions (`fix: ...`, `feat: ...`) and commits the `dist/index.js` file. Then it pushes the changes to the `v1` branch, so that users will always get the latest version when referencing `probot/exmaple-github-action@v1`. If there should ever be a breaking change, we would change the publish branch to `v2`, etc.

## License

[ISC](LICENSE)
