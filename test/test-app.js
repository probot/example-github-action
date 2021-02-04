// This app is used in .github/workflows/test.yml
const { relative } = require("path");
const { run } = require("../tmp-github-action-adapter");

run(app).catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * @param {import('probot').Probot} app
 */
async function app(app) {
  app.log.debug("This is a debug message");
  app.log.info("This is an info message");
  app.log.warn("This is a warning message");

  app.on("push", async (context) => {
    await context.octokit.request(
      "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments",
      context.repo({
        commit_sha: context.payload.head_commit.id,
        body: `Hello from ${relative(process.cwd(), __filename)}`,
      })
    );
  });
}
