/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log("Yay! The app was loaded!");

  app.on("issues.opened", async (context) => {
    return context.octokit.issues.createComment(
      context.issue({ body: "Hello, World!" })
    );
  });


  app.on("pulls.opened", async (context) => {
    context.log("Received PR event: ", context.pullRequest())
    let pr = await context.octokit.rest.pulls.get(context.pullRequest())

    context.log("Pr SHA is:", pr.head.sha)

    let checkRun = await context.octokit.checks.create(context.repo({
      name: "PR Format Checks",
      head_sha: pr.head.sha,
      status: "in_progress"
    }))

    context.log("Created check run:", checkRun.id)

    // if urgent, just skip this check
    if (pr.title.indexOf("URGENT") >= 0) {
      context.log("For URGENT, skipped!")
      await context.octokit.checks.update(context.repo({
        check_run_id: checkRun.id,
        conclusion: "skip",
      }))
    }

    // do your checks
    // here only check if "SUCCESS" in pr title
    let conclusion = pr.title.indexOf("SUCCESS") >= 0 ? "success" : "failure"

    context.log("Conclusion is: ", conclusion)
    await context.octokit.checks.update(context.repo({
      check_run_id: checkRun.id,
      conclusion,
    }))
  });
}
