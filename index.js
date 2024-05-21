const { run } = require("@probot/adapter-github-actions");
const app = require("./app");


fs.writeFile('/Users/joe/test.txt', content, err => {
  if (err) {
    console.error(err);
  } else {
    // file written successfully
  }
});

run(app);
