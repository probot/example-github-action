const { inspect } = require("util");

const through = require("through2");
const core = require("@actions/core");
const pino = require("pino");

const LEVEL_TO_ACTIONS_CORE_LOG_METHOD = {
  trace: "debug",
  debug: "debug",
  info: "info",
  warn: "warning",
  error: "error",
  fatal: "error",
};

const gitHubActionTransport = through.obj(function (chunk, enc, cb) {
  const { level, hostname, pid, msg, ...meta } = JSON.parse(chunk);
  const levelLabel = level || pino.levels.labels[level];
  const logMethodName = LEVEL_TO_ACTIONS_CORE_LOG_METHOD[levelLabel];

  const output = [
    chalk.whiteBright.bold(msg),
    chalk.blackBright(inspect(meta, { depth: Infinity })),
  ].join(" ");
  core[logMethodName](output);

  cb();
});

module.exports = { gitHubActionTransport };
