const { inspect } = require("util");

const through = require("through2");
const core = require("@actions/core");
const pino = require("pino");
const chalk = require("chalk");

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
  const levelLabel = pino.levels.labels[level] || level;
  const logMethodName = LEVEL_TO_ACTIONS_CORE_LOG_METHOD[levelLabel];

  const output = [
    chalk.whiteBright.bold(msg),
    chalk.blackBright(inspect(meta, { depth: Infinity })),
  ].join(" ");

  if (logMethodName in core) {
    core[logMethodName](output);
  } else {
    core.error(`"${level}" is not a known log level - ${output}`);
  }

  cb();
});

module.exports = { gitHubActionTransport };
