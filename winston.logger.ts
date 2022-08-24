import { createLogger, format, transports } from 'winston';
import Sentry from 'winston-transport-sentry-node';
const { combine, timestamp, json, colorize } = format;
const sentryOptions = {
    sentry: {
      dsn: process.env.sentryDNS??"",
    },
    level: 'info'
  };
export const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        json(),
        colorize()
    ),
    transports: [
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
        new Sentry(sentryOptions),
    ],
    exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' }),
    ],
    rejectionHandlers: [
        new transports.File({ filename: 'logs/rejections.log' }),
    ],
});
if (process.env.NODE_ENV !== 'production')
    logger.add(
        new transports.Console({
            format: format.simple(),
        })
    );
