import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, json, colorize } = format;

const logtail = new Logtail(process.env.logtailToken);

export const logger = createLogger({
    level: 'error',
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
        new LogtailTransport(logtail),
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
