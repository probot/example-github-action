/**
 * @param {import('probot').Probot} app
 */
export default (app) => {
  app.log.info("Yay! The app was loaded!");

  app.on("issues.opened", async (context) => {
    return context.octokit.issues.createComment(
      context.issue({ body: "Hello, World!" })
    );
  });
};
