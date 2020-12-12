# Probot & GitHub Action example

> This repository is an example of how to create a GitHub Action using Probot

[![Build Status](https://github.com/octokit/request-action/workflows/Test/badge.svg)](https://github.com/octokit/request-action/actions)

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
      - uses: probot/exmaple-github-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Se the action in ... action [#1](https://github.com/probot/example-github-action/issues/1)

## How it works

The Probot application function is defined in [`app.js`](app.js).

The Action will run the [`index.js`](index.js) file which verifies the required environment variables are set, loads the Probot application function and then receives the event from the file system.

## License

[ISC](LICENSE)
