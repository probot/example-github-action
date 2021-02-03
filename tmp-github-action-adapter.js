module.exports = { run };

const { createProbot } = require("probot");
const pino = require("pino");

const { gitHubActionTransport } = require("./tmp-pino-transport");

async function run(app) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error(
      "[probot/example-github-action] env.GITHUB_TOKEN must be set, see https://github.com/probot/example-github-action#usage"
    );
  }

  const envVariablesMissing = [
    "GITHUB_RUN_ID",
    "GITHUB_EVENT_NAME",
    "GITHUB_EVENT_PATH",
  ].filter((name) => !process.env[name]);

  if (envVariablesMissing.length) {
    throw new Error(
      `[probot/example-github-action] GitHub Action default environment variables missing: ${envVariablesMissing.join(
        ", "
      )}. See https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables`
    );
  }

  const probot = createProbot({
    overrides: {
      githubToken: process.env.GITHUB_TOKEN,
      log: pino({ level: process.env.LOG_LEVEL }, gitHubActionTransport),
    },
  });

  await probot.load(app);

  return probot.receive({
    id: process.env.GITHUB_RUN_ID,
    name: process.env.GITHUB_EVENT_NAME,
    payload: require(process.env.GITHUB_EVENT_PATH),
  });
}
