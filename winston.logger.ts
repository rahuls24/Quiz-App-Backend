import { createLogger, format, transports } from "winston";
import Sentry from "winston-transport-sentry-node";
const { combine, timestamp, json, colorize } = format;
const sentryOptions = {
  sentry: {
    dsn: process.env.sentryDNS ?? ""
  },
  level: "info"
};
export const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A"
    }),
    json(),
    colorize()
  ),
  transports: [new Sentry(sentryOptions)]
});
if (process.env.NODE_ENV !== "production")
  logger.add(
    new transports.Console({
      format: format.simple()
    })
  );