// const { run } = require("@probot/github-action");
const { run } = require("./tmp-github-action-adapter");
const app = require("./app");

run(app).catch((error) => {
  console.error(error);
  process.exit(1);
});
