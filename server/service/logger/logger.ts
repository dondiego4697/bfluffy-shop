import {createLogger, format, transports} from 'winston';
import {config} from 'app/config';

const {printf} = format;

const loggerFormat = printf((data) => {
    return Object.entries(data)
        .map(([key, value]) => {
            if (typeof value === 'object') {
                return `${key}=${JSON.stringify(value)}`;
            }

            // TODO filter headers

            return `${key}=${value}`;
        })
        .join('\t');
});

export const logger = createLogger({
    silent: process.env.DISABLE_LOGGING === '1',
    level: config['logger.level'],
    format: format.combine(
        config['logger.colorize'] ? format.colorize() : format.uncolorize(),
        format.timestamp(),
        loggerFormat
    ),
    transports: [new transports.Console()]
});
