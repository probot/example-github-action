/**
 * @param {import('probot').Probot} app
 */

 const createCheck = ({ pass, failureStatus, output, startedAt, context }) => {
  const pullRequest = context.payload.pull_request;

  let checkOptions = {
    name: "jira-ticket-checker",
    head_sha: pullRequest.head.sha,
    started_at: startedAt
  };
  if (!pass) {
    checkOptions = {
      ...checkOptions,
      status: "in_progress",
      output
    };
    if (failureStatus === "failure") {
      checkOptions.completed_at = new Date();
      checkOptions.status = "completed";
      checkOptions.conclusion = "failure";
    } else if (failureStatus !== "in_progress") {
      console.log(`failureStatus ${failureStatus} is invalid,
        use in_progress by default`);
    }
  } else {
    checkOptions = {
      ...checkOptions,
      completed_at: new Date(),
      status: "completed",
      conclusion: "success",
      output: {
        title: "Ready for review",
        summary: "Ticket checks passed"
      }
    };
  }
  return context.github.checks.create(context.repo(checkOptions));
};

const extractJiraRefs = str => str.match(/[A-Z]+-[0-9]+/g) || [];

const validateJiraRefs = async (ref, jiraBaseUrl) => {
  const axios = require("axios");
  const response = await axios
    .get(`${jiraBaseUrl}/rest/api/2/issue/${ref}`, {
      headers: { "Content-Type": "application/json" }
    })
    .catch(function(error) {
      return {
        ref,
        error
      };
    });

  return response;
};

module.exports = (app) => {
  app.log("Yay! The app was loaded!");

  app.on( 
    [
      "pull_request.opened",
      "pull_request.edited",
      "pull_request.reopened",
      "pull_request.synchronize",
      "pull_request.review_requested",
      "check_run.rerequested"
    ], async (context) => {
      const startedAt = new Date();
      const {
        head: { ref: branch },
        title
      } = context.payload.pull_request;
    
      const jiraRefs = extractJiraRefs(title + branch);
    
      let pass = true;
    
      const config = await context.config("config.yml");
    
      if (!config || !config.jiraBaseUrl) {
        const configYmlProblem = !config
          ? "Your repository is missing a valid `.github/config.yml` configuration file\n\n"
          : "No value was found for `jiraBaseUrl` in your repository's `.github/config.yml` file.\n\n";
    
        return createCheck({
          pass: false,
          failureStatus: "failure",
          output: {
            title: !config
              ? "Missing `.github/config.yml` file"
              : "No Jira base url specified",
            summary:
              configYmlProblem +
              "You can optionally create a repository named `.github` in your organization and its" +
              "`.github/config.yml` file will be used by all repositories in your organization."
          },
          startedAt,
          context
        });
      }
      
      const regexFromString = (str) => {
        const [, pattern, flag] = /^\/(.*)\/([a-z]*)$/.exec(str)
        return new RegExp(pattern, flag)
      }
    
      const headBranchExcluded = config.exclusionRegEx ? regexFromString(config.exclusionRegEx).test(branch) : false
    
      if (headBranchExcluded) {
        return createCheck({ pass: true, startedAt, context });
      }
    
      const validatedJiraRefs = jiraRefs.map(ref =>
        validateJiraRefs(ref, config.jiraBaseUrl)
      );
    
      if (!validatedJiraRefs.length) {
        return createCheck({
          pass: false,
          failureStatus: "failure",
          output: {
            title: "No Jira ticket found in PR",
            summary:
              "A valid Jira ticket was not found in either the pull request title or branch name.\n\n" +
              "Please rename your pull request title or branch name to include an associated Jira ticket."
          },
          startedAt,
          context
        });
      }
    
      const fourOhFourErrors = [];
      const unknownErrors = [];
    
      const isFourOhFourError = value => String(value.error).includes("404");
      const hasNonFourOhOneErrors = value => !String(value.error).includes("401");
    
      return Promise.all(validatedJiraRefs)
        .then(values => {
          values.forEach(val => {
            if (hasNonFourOhOneErrors(val)) {
              pass = false;
    
              if (isFourOhFourError(val)) {
                fourOhFourErrors.push(`  - ${val.ref}`);
              } else {
                unknownErrors.push(`  - ${val.ref} - error: ${val.error.message}`);
              }
            }
          });
        })
        .finally(() => {
          if (!pass) {
            const notFoundSummary = fourOhFourErrors.length
              ? "The following are not valid Jira tickets: \n\n" +
                fourOhFourErrors.join("\n") +
                "\n\nPlease rename your branch or pull request title to include an associated Jira ticket."
              : "";
            const unknownSummary = unknownErrors.length
              ? "\n\nThe following tickets have unknown errors: \n\n" +
                unknownErrors.join("\n")
              : "";
            return createCheck({
              pass: false,
              failureStatus: "failure",
              output: {
                title: `Invalid Jira ticket${
                  notFoundSummary.length > 1 ? "s" : ""
                } found in PR`,
                summary: notFoundSummary + unknownSummary
              },
              startedAt,
              context
            });
          }
          return createCheck({ pass: true, startedAt, context });
        });      
    // return context.octokit.issues.createComment(
    //   context.issue({ body: "Hello, World!" })
    // );
  });
};
