import { beforeEach, test } from "node:test";
import assert from "node:assert";

import nock from "nock";
nock.disableNetConnect();

// disable Probot logs
process.env.LOG_LEVEL = "fatal";
import { Probot, ProbotOctokit } from "probot";

import app from "../app.js";

/** @type {import('probot').Probot */
let probot;
beforeEach(() => {
  probot = new Probot({
    id: 1,
    githubToken: "test",
    Octokit: ProbotOctokit.defaults({
      throttle: { enabled: false },
      retry: { enabled: false },
    }),
  });
  probot.load(app);
});

test("recieves issues.opened event", async function () {
  const mock = nock("https://api.github.com")
    // create new check run
    .post(
      "/repos/probot/example-github-action/issues/1/comments",
      (requestBody) => {
        assert.deepStrictEqual(requestBody, { body: "Hello, World!" });

        return true;
      }
    )
    .reply(201, {});

  await probot.receive({
    name: "issues",
    id: "1",
    payload: {
      action: "opened",
      repository: {
        owner: {
          login: "probot",
        },
        name: "example-github-action",
      },
      issue: {
        number: 1,
      },
    },
  });

  assert.deepStrictEqual(mock.activeMocks(), []);
});
